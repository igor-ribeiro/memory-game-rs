use crate::{
    components::{card::Card, game_provider::GameContext},
    constants::{ANIMALS_COUNT, ANIMALS_IMAGE, COLORS, NBA_LOGOS},
    game::{get_board_cols, Action, CardType},
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
        CardType::Animals => (0..=ANIMALS_COUNT)
            .map(|i| {
                let card_size = 100;

                format!(
                    "background-image: url({}); \
                        background-size: {}px;\
                        background-position: {}px center",
                    ANIMALS_IMAGE,
                    card_size * ANIMALS_COUNT,
                    i * card_size
                )
            })
            .collect::<Vec<_>>(),
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

#[derive(Properties, PartialEq)]
pub struct BoardProps {
    pub children: Children,
}

#[function_component(Board)]
pub fn board(BoardProps { children }: &BoardProps) -> Html {
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
            CardType::Animals => {
                let image = HtmlImageElement::new().unwrap();
                image.set_src(ANIMALS_IMAGE);
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

    let style = format!(
        "grid-template-columns: repeat({}, 100px)",
        get_board_cols(game.card_type)
    );

    let on_restart = {
        let game = game.clone();
        move |_| {
            game.dispatch(Action::Restart);
        }
    };

    html! {
        <div>
            <div class="grid gap-2" style={style}>
                {for board}
            </div>

            <div class="flex gap-2 justify-between mt-4">
                {for children.iter()}

                if game.game_over {
                    <button class="btn" onclick={on_restart}>{"Jogar novamente"}</button>
                }
            </div>
        </div>
    }
}
