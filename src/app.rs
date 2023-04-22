use std::borrow::BorrowMut;
use wasm_bindgen::{prelude::Closure, JsCast};
use web_sys::window;
use yew::prelude::*;

use crate::game::{Action, Game};

const COLORS: [&str; 12] = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-neutral-300",
    "bg-purple-400",
    "bg-pink-400",
    "bg-teal-400",
    "bg-cyan-300",
    "bg-neutral-600",
    "bg-black",
];

#[function_component(App)]
pub fn app() -> Html {
    let game = use_reducer(Game::new);
    let mut timeout_id = use_mut_ref::<Option<i32>, _>(|| None);
    let mut timeout_callback = use_mut_ref::<Option<Closure<dyn Fn()>>, _>(|| None);

    {
        let guess = game.guess;
        let dispatcher = game.dispatcher().clone();

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
                        1000,
                    )
                    .unwrap();

                timeout_id.borrow_mut().replace(Some(new_timeout_id));
            },
            guess,
        );
    }

    let players = game.players.iter().enumerate().map(|(i, player)| {
        let is_turn = game.turn == i;

        html! {
            <div
                key={player.name}
                class={classes!(
                    "w-[100px] flex-1 text-center flex flex-col justify-between relative overflow-hidden".to_string(),
                    is_turn.then_some("font-bold").or(Some("text-gray-600")),
                )}
            >
                <span>
                    {player.name}
                </span>

                <span
                    key={player.points}
                    class="text-3xl animate-[ping_.7s_ease-in-out_1] [animation-direction:reverse]"
                >
                    {player.points}
                </span>

                <div
                    class={classes!(
                        "z-[-1] w-full h-full absolute left-0 top-0 bg-gray-300".to_string(),
                        is_turn.then_some("opacity-1 animate-pulse").or(Some("opacity-0")),
                    )}
                />
            </div>
        }
    });

    let board = game.cards.iter().enumerate().map(|(i, card)| {
        let on_click = {
            let game = game.clone();
            let open_card = Callback::from(move |pos: usize| game.dispatch(Action::OpenCard(pos)));

            move |_| open_card.emit(i)
        };

        let mut is_opened = false;

        if game.opened.contains_key(&i) {
            is_opened = true;
        }

        if let Some(pos) = game.guess.0 {
            if pos == i {
                is_opened = true;
            }
        }

        if let Some(pos) = game.guess.1 {
            if pos == i {
                is_opened = true;
            }
        }

        let color = COLORS[(card.value - 1) as usize];

        html! {
            <div
                key={card.id}
                class={classes!(
                    "flex w-[100px] h-[100px] items-center justify-center".to_string(),
                    is_opened
                        .then_some(color)
                        .or(Some("hover:bg-gray-100 cursor-pointer border border-gray-400".clone()))
                )}
                onclick={on_click}
            >
            </div>
        }
    });

    html! {
        <div class="p-2 flex flex-col gap-4 items-center">
            <div class="flex p-2 border border-gray-400 gap-2">
                {for players}
            </div>

            <div class="grid grid-cols-[repeat(4,100px)] gap-2">
                {for board}
            </div>
        </div>
    }
}
