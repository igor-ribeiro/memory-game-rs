use crate::{components::game_provider::GameContext, game::Action, hooks::use_reset_guess};
use yew::prelude::*;

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

#[function_component(Board)]
pub fn board() -> Html {
    let game = use_context::<GameContext>().unwrap();

    use_reset_guess();

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
                        .or(Some("hover:bg-gray-100 cursor-pointer border border-gray-400"))
                )}
                onclick={on_click}
            >
            </div>
        }
    });

    html! {
        <div class="grid grid-cols-[repeat(4,100px)] gap-2">
            {for board}
        </div>
    }
}
