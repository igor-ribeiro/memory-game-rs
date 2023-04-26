use crate::{
    components::{card::Card, game_provider::GameContext},
    constants::{COLORS, NBA_LOGOS},
    game::{Action, CardType},
    hooks::use_reset_guess,
};
use web_sys::HtmlImageElement;
use yew::prelude::*;

fn get_card_style(card_type: &CardType) -> Vec<String> {
    match card_type {
        CardType::NBA => NBA_LOGOS
            .iter()
            .map(|url| format!("background-image: url({url})"))
            .collect::<Vec<_>>(),
        CardType::Colors => COLORS
            .iter()
            .map(|color| format!("background-color: {color}"))
            .collect::<Vec<_>>(),
        _ => vec![],
    }
}

fn get_back_card_style(card_type: &CardType) -> Option<String> {
    match card_type {
        CardType::NBA => {
            Some("background-image: url(/public/nba-logo.png); background-size: cover;".to_string())
        }
        _ => None,
    }
}

#[function_component(Board)]
pub fn board() -> Html {
    let game = use_context::<GameContext>().unwrap();
    let card_style = get_card_style(&game.card_type);
    let back_card_style = get_back_card_style(&game.card_type);

    use_reset_guess();

    use_effect_with_deps(
        |card_type| match card_type {
            CardType::NBA => {
                NBA_LOGOS.iter().for_each(|url| {
                    let image = HtmlImageElement::new().unwrap();
                    image.set_src(url);
                });
            }
            _ => {}
        },
        game.card_type,
    );

    let board = game.cards.iter().enumerate().map(|(position, card)| {
        let on_flip = {
            let game = game.clone();
            Callback::from(move |pos: usize| game.dispatch(Action::FlipCard(pos)))
        };

        let style = card_style[card.value as usize].to_string();

        html! {
            <Card
                key={card.id}
                card={*card}
                {on_flip}
                {position}
                card_style={style}
                back_card_style={back_card_style.clone()}
            />
        }
    });

    let cards_len = game.cards.len();

    html! {
        <div class="grid grid-cols-[repeat(10,100px)] gap-2">
            {for board}
        </div>
    }
}
