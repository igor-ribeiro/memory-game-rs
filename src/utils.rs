use wasm_bindgen::JsValue;
use web_sys::{window, CustomEvent, CustomEventInit};

use crate::game::Sound;

pub fn is_option_value<T: PartialEq>(value: &Option<T>, option: &T) -> bool {
    value.as_ref().map(|v| v == option).unwrap_or_default()
}

pub fn play_sound(sound: Sound) {
    let window = window().unwrap();
    let sound_type = match sound {
        Sound::Success => "success",
        Sound::Error => "error",
        Sound::Start => "start",
    };

    let event = CustomEvent::new_with_event_init_dict(
        "play-sound",
        CustomEventInit::new().detail(&JsValue::from_str(sound_type)),
    )
    .unwrap();

    window.dispatch_event(&event).unwrap();
}
