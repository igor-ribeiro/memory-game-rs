use yew::prelude::*;

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
        back_card_style,
    } = props.clone();

    let onclick = move |_| on_flip.emit(position);

    html! {
        <div
            key={card.id}
            style={card.flipped.then_some(card_style).or(back_card_style)}
            class={classes!(
                "flex w-full h-full items-center justify-center border border-gray-400 rounded".to_string(),
                card.flipped
                    .then_some("")
                    .or(Some("cursor-pointer hover:bg-neutral-100"))
            )}
            {onclick}
        >
        </div>
    }
}
