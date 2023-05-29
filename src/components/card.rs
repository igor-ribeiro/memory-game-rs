use yew::prelude::*;

use super::game_provider::GameContext;

#[derive(Properties, PartialEq, Clone)]
pub struct Props {
    pub card: crate::game::Card,
    pub on_flip: Callback<usize>,
    pub position: usize,
    pub style: String,
    pub front_style: String,
}

#[function_component(Card)]
pub fn card(props: &Props) -> Html {
    let Props {
        card,
        on_flip,
        position,
        front_style,
        style,
        ..
    } = props.clone();

    let game = use_context::<GameContext>().unwrap();
    let on_click = move |_| on_flip.emit(position);

    let has_first_guess = Some(position) == game.guess.0;
    let has_second_guess = Some(position) == game.guess.1;
    let was_guessed = has_first_guess || has_second_guess;

    let should_animate = card.flipped && !was_guessed && !game.flip_all;

    html! {
        <div
            role="button"
            key={card.id.to_string()}
            data-key={card.id.to_string()}
            style={style}
            class={classes!(
                "card".to_string(),
                game.game_started.then_some("").or(Some("opacity-0 animate-start")),
                should_animate
                    .then_some("is-correct")
                    .or(Some("cursor-pointer")),
            )}
            onclick={on_click}
            data-flipped={card.flipped.to_string()}
        >
                <span
                    class="card-front"
                    style={front_style}
                ></span>
                <span class="card-back">
                    {position + 1}
                </span>
        </div>
    }
}
