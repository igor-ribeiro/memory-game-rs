use crate::game::{Game, GameMode, GameSetup, ScoreType};
use yew::prelude::*;

pub type GameContext = UseReducerHandle<Game>;

#[derive(Properties, PartialEq)]
pub struct Props {
    pub init: GameSetup,
    pub children: Children,
}

#[function_component(GameProvider)]
pub fn game_provider(Props { init, children }: &Props) -> Html {
    let game = use_reducer(|| match init.score_type {
        ScoreType::Hits { .. } => match init.mode {
            GameMode::SinglePlayer => Game::with_single_player_points(init.card_type),
            GameMode::MultiPlayer => Game::with_multi_player_points(init.card_type),
        },
        ScoreType::Time { .. } => match init.mode {
            GameMode::SinglePlayer => Game::with_single_player_time(init.card_type),
            GameMode::MultiPlayer => Game::with_multi_player_time(init.card_type),
        },
    });

    html! {
        <ContextProvider<GameContext> context={game}>
            {for children.iter() }
        </ContextProvider<GameContext>>
    }
}
