use yew::prelude::*;

use super::game_provider::GameContext;

#[derive(Properties, PartialEq, Clone)]
pub struct Props {
    pub card: crate::game::Card,
    pub on_flip: Callback<usize>,
    pub position: usize,
    pub card_style: String,
    pub back_card_style: Option<String>,
}

#[function_component(Card)]
pub fn card(props: &Props) -> Html {
    let Props {
        card,
        on_flip,
        position,
        card_style,
        ..
    } = props.clone();

    let game = use_context::<GameContext>().unwrap();
    let on_click = move |_| on_flip.emit(position);

    let has_first_guess = Some(position) == game.guess.0;
    let has_second_guess = Some(position) == game.guess.1;
    let was_guessed = has_first_guess || has_second_guess;
    let _is_wrong = match game.guess {
        (Some(first), Some(second)) => first != position || second != position,
        _ => false,
    };

    let should_dim = game.guess.0.is_some()
        && game.guess.1.is_some()
        && Some(position) != game.guess.0
        && Some(position) != game.guess.1;

    let should_animate = card.flipped && !was_guessed && !game.flip_all;

    html! {
        <div
            role="button"
            key={card.id}
            style={format!("--position: {};", position)}
            class={classes!(
                "card w-full grid grid-cols-1 grid-rows-1 h-full items-center justify-center border border-gray-400 rounded transition-transform select-none".to_string(),
                was_guessed
                    .then_some("")
                    .or(Some("border-gray-400")),
                should_dim
                    .then_some("opacity-50 scale-95")
                    .or(Some("opacity-100")),
                should_animate
                    .then_some("is-correct")
                    .or(Some("cursor-pointer")),
            )}
            onclick={on_click}
            data-flipped={card.flipped.to_string()}
        >
                <span
                    class="card-front"
                    style={card_style}
                ></span>
                <span class="card-back">
                    {position + 1}
                </span>
        </div>
    }
}
