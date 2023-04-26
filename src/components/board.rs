use crate::{
    components::{card::Card, game_provider::GameContext},
    constants::{ANIMALS_COUNT, ANIMALS_IMAGE, COLORS, DISNEY_COUNT, DISNEY_IMAGE, NBA_LOGOS},
    game::{get_board_grid, Action, CardType},
    hooks::use_reset_guess,
};
use web_sys::HtmlImageElement;
use yew::prelude::*;

fn get_background_image_style(image: &str, count: i32, position: i32) -> String {
    format!(
        "background-image: url({}); \
                        background-size: calc(var(--card-size) * {});\
                        background-position: calc(var(--card-size) * {}) center",
        image, count, position
    )
}

fn get_card_style(card_type: &CardType) -> Vec<String> {
    match card_type {
        CardType::NBA => NBA_LOGOS
            .iter()
            .map(|url| format!("background-image: url({url})"))
            .collect(),
        CardType::Colors => COLORS
            .iter()
            .map(|color| format!("background-color: {color}"))
            .collect::<Vec<_>>(),
        CardType::Animals => (0..=ANIMALS_COUNT)
            .map(|i| get_background_image_style(ANIMALS_IMAGE, ANIMALS_COUNT, i))
            .collect::<Vec<_>>(),
        CardType::Disney => (0..=DISNEY_COUNT)
            .map(|i| get_background_image_style(DISNEY_IMAGE, DISNEY_COUNT, i))
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
        |card_type| {
            match card_type {
                CardType::NBA => {
                    // Preload images.
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
            }
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

    let board_grid = get_board_grid(game.card_type);

    let style = format!(
        "grid-template-columns: repeat({}, var(--card-size));\
            grid-template-rows: repeat({}, var(--card-size));\
            grid-gap: var(--card-gap);",
        board_grid.0, board_grid.1,
    );

    let on_restart = {
        let game = game.clone();
        move |_| {
            game.dispatch(Action::Restart);
        }
    };

    html! {
        <div class="flex-1 flex flex-col items-center">
            <div class="grid" style={style}>
                {for board}
            </div>

            <div class="flex gap-2 mt-4">
                {for children.iter()}

                <button class="btn" onclick={on_restart} disabled={!game.game_over}>
                    {"Jogar novamente"}
                </button>
            </div>
        </div>
    }
}
