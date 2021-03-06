
/*= provides zen_mode:enter */


/*= provides zen_mode:leave */


/*= require jquery.scrollTo */


/*= require dropzone */


/*= require mousetrap */


/*= require mousetrap/pause */

(function() {
  this.ZenMode = (function() {
    function ZenMode() {
      this.active_backdrop = null;
      this.active_textarea = null;
      $(document).on('click', '.js-zen-enter', function(e) {
        e.preventDefault();
        return $(e.currentTarget).trigger('zen_mode:enter');
      });
      $(document).on('click', '.js-zen-leave', function(e) {
        e.preventDefault();
        return $(e.currentTarget).trigger('zen_mode:leave');
      });
      $(document).on('zen_mode:enter', (function(_this) {
        return function(e) {
          return _this.enter($(e.target).closest('.md-area').find('.zen-backdrop'));
        };
      })(this));
      $(document).on('zen_mode:leave', (function(_this) {
        return function(e) {
          return _this.exit();
        };
      })(this));
      $(document).on('keydown', function(e) {
        if (e.keyCode === 27) {
          e.preventDefault();
          return $(document).trigger('zen_mode:leave');
        }
      });
    }

    ZenMode.prototype.enter = function(backdrop) {
      Mousetrap.pause();
      this.active_backdrop = $(backdrop);
      this.active_backdrop.addClass('fullscreen');
      this.active_textarea = this.active_backdrop.find('textarea');
      this.active_textarea.removeAttr('style');
      return this.active_textarea.focus();
    };

    ZenMode.prototype.exit = function() {
      if (this.active_textarea) {
        Mousetrap.unpause();
        this.active_textarea.closest('.zen-backdrop').removeClass('fullscreen');
        this.scrollTo(this.active_textarea);
        this.active_textarea = null;
        this.active_backdrop = null;
        return Dropzone.forElement('.div-dropzone').enable();
      }
    };

    ZenMode.prototype.scrollTo = function(zen_area) {
      return $.scrollTo(zen_area, 0, {
        offset: -150
      });
    };

    return ZenMode;

  })();

}).call(this);
