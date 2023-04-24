use crate::{components::game_provider::GameContext, game::Action};
use std::borrow::BorrowMut;
use wasm_bindgen::{prelude::Closure, JsCast};
use web_sys::window;
use yew::prelude::*;

#[hook]
pub fn use_reset_guess() {
    let game = use_context::<GameContext>().unwrap();

    let mut timeout_id = use_mut_ref::<Option<i32>, _>(|| None);
    let mut timeout_callback = use_mut_ref::<Option<Closure<dyn Fn()>>, _>(|| None);

    {
        let guess = game.guess;
        let dispatcher = game.dispatcher();

        use_effect_with_deps(
            move |_| {
                let window = window().unwrap();
                let timeout = timeout_id.as_ref().borrow().to_owned();

                if guess.0.is_none() && guess.1.is_none() {
                    return;
                }

                if let Some(id) = timeout {
                    window.clear_timeout_with_handle(id);
                }

                let callback = Closure::<dyn Fn()>::new(move || {
                    dispatcher.dispatch(Action::NextTurn);
                });

                timeout_callback.borrow_mut().replace(Some(callback));

                let new_timeout_id = window
                    .set_timeout_with_callback_and_timeout_and_arguments_0(
                        timeout_callback
                            .as_ref()
                            .borrow()
                            .as_ref()
                            .unwrap()
                            .as_ref()
                            .unchecked_ref(),
                        800,
                    )
                    .unwrap();

                timeout_id.borrow_mut().replace(Some(new_timeout_id));
            },
            guess,
        );
    }
}
