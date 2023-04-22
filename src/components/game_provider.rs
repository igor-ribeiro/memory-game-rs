use crate::game::Game;
use yew::prelude::*;

pub type GameContext = UseReducerHandle<Game>;

#[derive(Properties, PartialEq)]
pub struct Props {
    pub children: Children,
}

#[function_component(GameProvider)]
pub fn game_provider(props: &Props) -> Html {
    let game = use_reducer(Game::new);

    html! {
        <ContextProvider<GameContext> context={game}>
            {for props.children.iter() }
        </ContextProvider<GameContext>>
    }
}
