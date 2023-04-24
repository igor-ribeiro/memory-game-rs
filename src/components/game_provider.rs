use crate::game::{Game, GameInit};
use yew::prelude::*;

pub type GameContext = UseReducerHandle<Game>;

#[derive(Properties, PartialEq)]
pub struct Props {
    pub init: GameInit,
    pub children: Children,
}

#[function_component(GameProvider)]
pub fn game_provider(props: &Props) -> Html {
    let game = use_reducer(|| match props.init {
        GameInit::Hits { single } => {
            if single {
                Game::with_single_player_points()
            } else {
                Game::with_multi_player_points()
            }
        }
        GameInit::Time { single } => {
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
