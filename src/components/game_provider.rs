use crate::game::{Game, GameSetup};
use yew::prelude::*;

pub type GameContext = UseReducerHandle<Game>;

#[derive(Properties, PartialEq)]
pub struct Props {
    pub init: GameSetup,
    pub children: Children,
}

#[function_component(GameProvider)]
pub fn game_provider(props: &Props) -> Html {
    let game = use_reducer(|| match props.init {
        GameSetup::Hits { single } => {
            if single {
                Game::with_single_player_points()
            } else {
                Game::with_multi_player_points()
            }
        }
        GameSetup::Time { single } => {
            if single {
                Game::with_single_player_time()
            } else {
                Game::with_multi_player_time()
            }
        }
    });

    html! {
        <ContextProvider<GameContext> context={game}>
            {for props.children.iter() }
        </ContextProvider<GameContext>>
    }
}
