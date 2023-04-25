use crate::game::{Game, GameMode, GameSetup, ScoreType};
use yew::prelude::*;

pub type GameContext = UseReducerHandle<Game>;

#[derive(Properties, PartialEq)]
pub struct Props {
    pub init: GameSetup,
    pub children: Children,
}

#[function_component(GameProvider)]
pub fn game_provider(props: &Props) -> Html {
    let game = use_reducer(|| match props.init.score_type {
        ScoreType::Hits { .. } => match props.init.mode {
            GameMode::SinglePlayer => Game::with_single_player_points(),
            GameMode::MultiPlayer => Game::with_multi_player_points(),
        },
        ScoreType::Time { .. } => match props.init.mode {
            GameMode::SinglePlayer => Game::with_single_player_time(),
            GameMode::MultiPlayer => Game::with_multi_player_time(),
        },
    });

    html! {
        <ContextProvider<GameContext> context={game}>
            {for props.children.iter() }
        </ContextProvider<GameContext>>
    }
}
