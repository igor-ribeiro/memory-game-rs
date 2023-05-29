use crate::{
    components::game_setup::{context::GameSetupContext, provider::use_game_setup},
    game::{Game, GameMode, ScoreType, Sound},
    utils::play_sound,
};
use log::info;
use std::borrow::BorrowMut;
use wasm_bindgen::{prelude::Closure, JsCast};
use web_sys::window;
use yew::prelude::*;

pub type GameContext = UseReducerHandle<Game>;

#[derive(Properties, PartialEq)]
pub struct Props {
    pub children: Children,
}

#[function_component(GameProvider)]
pub fn game_provider(Props { children }: &Props) -> Html {
    let GameSetupContext { setup, .. } = use_game_setup();

    let game = use_reducer(|| match setup.score_type {
        Some(ScoreType::Hits { .. }) => match setup.game_mode {
            Some(GameMode::SinglePlayer) => {
                Game::with_single_player_points(setup.card_type.unwrap())
            }
            Some(GameMode::MultiPlayer) => Game::with_multi_player_points(setup.card_type.unwrap()),
            None => unreachable!(),
        },
        Some(ScoreType::Time { .. }) => match setup.game_mode {
            Some(GameMode::SinglePlayer) => Game::with_single_player_time(setup.card_type.unwrap()),
            Some(GameMode::MultiPlayer) => Game::with_multi_player_time(setup.card_type.unwrap()),
            None => unreachable!(),
        },
        None => unreachable!(),
    });

    let mut timeout_id = use_mut_ref::<Option<i32>, _>(|| None);
    let mut timeout_callback = use_mut_ref::<Option<Closure<dyn Fn()>>, _>(|| None);

    let dispatcher = game.dispatcher();

    use_effect_with_deps(
        |correct_guess| {
            if let Some(correct_guess) = correct_guess {
                play_sound(if *correct_guess {
                    Sound::Success
                } else {
                    Sound::Error
                });
            }
        },
        game.correct_guess,
    );

    use_effect_with_deps(
        move |next_action| {
            let window = window().unwrap();
            let timeout = timeout_id.as_ref().borrow().to_owned();

            if let Some(next_action) = next_action {
                if let Some(id) = timeout {
                    window.clear_timeout_with_handle(id);
                }

                let next_action = next_action.clone();

                let callback = Closure::<dyn Fn()>::new(move || {
                    dispatcher.dispatch(next_action.action.clone());
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
                        next_action.after_ms,
                    )
                    .unwrap();

                timeout_id.borrow_mut().replace(Some(new_timeout_id));
            }
        },
        game.next_action.clone(),
    );

    html! {
        <ContextProvider<GameContext> context={game}>
            {for children.iter() }
        </ContextProvider<GameContext>>
    }
}
