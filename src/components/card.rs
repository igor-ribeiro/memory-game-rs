use yew::prelude::*;

use crate::constants::COLORS;

#[derive(Properties, PartialEq, Clone)]
pub struct Props {
    pub card: crate::game::Card,
    pub on_flip: Callback<usize>,
    pub is_flipped: bool,
    pub position: usize,
}

#[function_component(Card)]
pub fn card(props: &Props) -> Html {
    let Props {
        card,
        on_flip,
        is_flipped,
        position,
    } = props.clone();

    let onclick = move |_| on_flip.emit(position);
    let color = COLORS[(card.value - 1) as usize];

    html! {
        <div
            key={card.id}
            class={classes!(
                "flex w-[100px] h-[100px] items-center justify-center".to_string(),
                is_flipped
                    .then_some(color)
                    .or(Some("hover:bg-gray-100 cursor-pointer border border-gray-400"))
            )}
            {onclick}
        >
        </div>
    }
}