const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Desklet = imports.ui.desklet;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;
const UUID = "clockTow@armandobs14";

// l10n/translation support
Gettext.bindtextdomain(UUID, GLib.get_home_dir() + "/.local/share/locale");

function _(str) {
  return Gettext.dgettext(UUID, str);
}

function MyDesklet(metadata) {
  this._init(metadata);
}

MyDesklet.prototype = {
  __proto__: Desklet.Desklet.prototype,

  _init: function(metadata) {
    Desklet.Desklet.prototype._init.call(this, metadata);
    this._clockContainer = new St.BoxLayout({ vertical: true, style_class: 'clock-container' });
    this._hourContainer = new St.BoxLayout({ vertical: false, style_class: 'hour-container' });
    this._dateContainer = new St.BoxLayout({ vertical: false, style_class: 'date-container' });

    this._hour = new St.Label({ style_class: "clock-hour-label" });
    this._min = new St.Label({ style_class: "clock-min-label" });
    this._ampmLabel = new St.Label({ style_class: "clock-ampm-label" });
    this._sec = new St.Label({ style_class: "clock-sec-label" }); // Sec label remains for potential future use
    this._date = new St.Label();

    this._hourContainer.add(this._hour);
    this._hourContainer.add(this._min);
    this._hourContainer.add(this._ampmLabel); // Add AM/PM label to the container
    this._dateContainer.add(this._date);
    this._clockContainer.add(this._hourContainer);
    this._clockContainer.add(this._dateContainer);
    this.setContent(this._clockContainer);
    this.setHeader(_("Clock"));

    this._updateDate();
  },

  on_desklet_removed: function() {
    Mainloop.source_remove(this.timeout);
  },

  _updateDate: function() {
    let hourFormat = "%I";
    let minFormat = "%M";
    let ampmFormat = "%p";
    let locale = GLib.getenv("LANG");

    if (locale) {
      locale = GLib.getenv("LANG").replace(/_/g, "-").replace(/\..+/, "");
    } else {
      locale = "en-US";
    }

    let displayDate = new Date();

    // Get hour, minutes, and AM/PM separately
    let hour = displayDate.toLocaleFormat(hourFormat);
    let minutes = displayDate.toLocaleFormat(minFormat);
    let ampm = displayDate.toLocaleFormat(ampmFormat);

    this._hour.set_text(hour);
    this._min.set_text(minutes);
    this._ampmLabel.set_text(ampm);
    this._date.set_text(displayDate.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      weekday: "long"
    }));

    this.timeout = Mainloop.timeout_add_seconds(1, Lang.bind(this, this._updateDate));
  }
};

function main(metadata, desklet_id) {
  let desklet = new MyDesklet(metadata, desklet_id);
  return desklet;
}
