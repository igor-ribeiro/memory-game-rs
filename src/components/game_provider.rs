use crate::{
    components::game_setup::{context::GameSetupContext, provider::use_game_setup},
    game::{Game, GameMode, ScoreType},
};
use yew::prelude::*;

pub type GameContext = UseReducerHandle<Game>;

#[derive(Properties, PartialEq)]
pub struct Props {
    pub children: Children,
}

#[function_component(GameProvider)]
pub fn game_provider(Props { children }: &Props) -> Html {
    let GameSetupContext { setup, .. } = use_game_setup();

    let game = use_reducer(|| match setup.score_type {
        Some(ScoreType::Hits { .. }) => match setup.game_mode {
            Some(GameMode::SinglePlayer) => {
                Game::with_single_player_points(setup.card_type.unwrap())
            }
            Some(GameMode::MultiPlayer) => Game::with_multi_player_points(setup.card_type.unwrap()),
            None => unreachable!(),
        },
        Some(ScoreType::Time { .. }) => match setup.game_mode {
            Some(GameMode::SinglePlayer) => Game::with_single_player_time(setup.card_type.unwrap()),
            Some(GameMode::MultiPlayer) => Game::with_multi_player_time(setup.card_type.unwrap()),
            None => unreachable!(),
        },
        None => unreachable!(),
    });

    html! {
        <ContextProvider<GameContext> context={game}>
            {for children.iter() }
        </ContextProvider<GameContext>>
    }
}
