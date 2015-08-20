class EmailReceiverWorker
  include Sidekiq::Worker

  sidekiq_options queue: :incoming_email

  def perform(raw)
    return unless Gitlab::ReplyByEmail.enabled?

    begin
      Gitlab::Email::Receiver.new(raw).execute
    rescue => e
      handle_failure(raw, e)
    end
  end

  private

  def handle_failure(raw, e)
    Rails.logger.warn("Email can not be processed: #{e}\n\n#{raw}")

    can_retry = false
    reason = nil

    case e
    when Gitlab::Email::Receiver::SentNotificationNotFoundError
      reason = "We couldn't figure out what the email is in reply to. Please create your comment through the web interface."
    when Gitlab::Email::Receiver::EmptyEmailError
      can_retry = true
      reason = "It appears that the email is blank. Make sure your reply is at the top of the email, we can't process inline replies."
    when Gitlab::Email::Receiver::AutoGeneratedEmailError
      reason = "The email was marked as 'auto generated', which we can't accept. Please create your comment through the web interface."
    when Gitlab::Email::Receiver::UserNotFoundError
      reason = "We couldn't figure out what user corresponds to the email. Please create your comment through the web interface."
    when Gitlab::Email::Receiver::UserNotAuthorizedError
      reason = "You are not allowed to respond to the thread you are replying to. If you believe this is in error, contact a staff member."
    when Gitlab::Email::Receiver::NoteableNotFoundError
      reason = "The thread you are replying to no longer exists, perhaps it was deleted? If you believe this is in error, contact a staff member."
    when Gitlab::Email::Receiver::InvalidNoteError
      can_retry = true
      reason = e.message
    else
      return
    end

    EmailRejectionMailer.delay.rejection(reason, raw, can_retry)
  end
end
