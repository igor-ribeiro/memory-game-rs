use wasm_bindgen::{prelude::Closure, JsCast};
use web_sys::{window, CustomEvent, HtmlAudioElement};
use yew::prelude::*;

#[function_component(Sounds)]
pub fn sounds() -> Html {
    let start_ref = use_node_ref();

    {
        let start_ref = start_ref.clone();

        use_effect_with_deps(
            |start_ref| {
                let window = window().expect("Unable to get window");

                let start_ref = start_ref.clone();

                let callback = Closure::<dyn Fn(CustomEvent)>::new(move |e: CustomEvent| {
                    let start_audio = start_ref
                        .cast::<HtmlAudioElement>()
                        .expect("start_ref not attached to div element");

                    if let Some(detail) = e.detail().as_string() {
                        let audio = match detail.as_str() {
                            "start" | "success" => Some(start_audio),
                            _ => None,
                        };

                        if let Some(audio) = audio {
                            audio.set_current_time(0.0);
                            let _ = audio.play().unwrap();
                        }
                    }
                });

                window
                    .add_event_listener_with_callback(
                        "play-sound",
                        callback.as_ref().unchecked_ref(),
                    )
                    .unwrap();

                callback.forget();
            },
            start_ref,
        );
    };

    html! {
        <>
            <audio ref={start_ref} src="./public/audio/start.mp3"></audio>
        </>
    }
}
