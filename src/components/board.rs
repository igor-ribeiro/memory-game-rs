use crate::{
    components::{
        card::Card,
        game_provider::GameContext,
        game_setup::{context::GameSetupContext, provider::use_game_setup},
    },
    constants::{
        ANIMALS_COUNT, ANIMALS_IMAGE, COLORS, DISNEY_COUNT, DISNEY_IMAGE, HARRY_POTTER_COUNT,
        HARRY_POTTER_IMAGE, NBA_LOGOS,
    },
    game::{get_board_grid, Action, CardType},
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
        CardType::NbaTeams => NBA_LOGOS
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
        CardType::HarryPotter => (0..=HARRY_POTTER_COUNT)
            .map(|i| get_background_image_style(HARRY_POTTER_IMAGE, HARRY_POTTER_COUNT, i))
            .collect::<Vec<_>>(),
    }
}

fn get_back_card_style(card_type: &CardType) -> Option<String> {
    match card_type {
        CardType::NbaTeams => {
            Some("background-image: url(/public/nba-logo.png); background-size: cover;".to_string())
        }
        _ => None,
        // _ => Some("background-color: #dedede".to_string()),
    }
}

#[derive(Properties, PartialEq)]
pub struct BoardProps {
    // pub children: Children,
}

#[function_component(Board)]
pub fn board() -> Html {
    let GameSetupContext { reset, .. } = use_game_setup();
    let game = use_context::<GameContext>().unwrap();
    let card_style = get_card_style(&game.card_type);
    let back_card_style = get_back_card_style(&game.card_type);
    let board_grid = get_board_grid(&game.card_type);

    use_effect_with_deps(
        |card_type| {
            match card_type {
                CardType::NbaTeams => {
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

        let style = format!(
            "--position: {}; --column: {};",
            position,
            position % board_grid.0 as usize
        );

        let front_style = format!("{};", card_style[card.value as usize],);

        html! {
            <Card
                key={card.id.to_string()}
                card={card.clone()}
                {on_flip}
                {position}
                style={style}
                front_style={front_style}
            />
        }
    });

    let style = format!(
        "grid-template-columns: repeat({}, var(--card-size));\
            grid-template-rows: repeat({}, var(--card-size));\
            grid-gap: var(--card-gap);",
        board_grid.0, board_grid.1,
    );

    let on_restart_game = {
        let game = game.clone();
        move |_| {
            game.dispatch(Action::RestartGame);
        }
    };

    let on_restart_turn = {
        let game = game.clone();
        move |_| {
            game.dispatch(Action::RestartTurn);
        }
    };

    let on_flash_cards = {
        let game = game.clone();
        move |_| {
            game.dispatch(Action::FlashCards(true));
        }
    };

    let on_reset = { move |_| reset.emit(()) };

    html! {
        <div class="flex-1 flex flex-col cartoon">
            <div class="flex-1 flex items-center justify-center p-2 bg-green-100">
                <div class="grid" style={style} data-game-over={game.game_over.to_string()} key={game.game_over.to_string()}>
                    {for board}
                </div>
            </div>

            <div class="flex bg-yellow-300 gap-2 border-t-2 border-black w-full p-2 justify-between">
                <button class="btn" onclick={on_reset}>
                    {"Voltar"}
                </button>

                <div class="flex gap-2">
                    <button class="btn" onclick={on_restart_game}>
                        {"Recomeçar Jogo"}
                    </button>
                    <button class="btn" onclick={on_flash_cards} disabled={game.game_started}>
                        {"Mostrar cartas"}
                    </button>
                    <button class="btn" onclick={on_restart_turn}>
                        {if game.game_over {
                            "Continuar"
                        } else {
                            "Recomeçar"
                        }}
                    </button>
                </div>
            </div>
        </div>
    }
}
