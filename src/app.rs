use crate::components::board::Board;
use crate::components::game_provider::GameProvider;
use crate::components::players::Players;
use yew::prelude::*;

#[function_component(App)]
pub fn app() -> Html {
    html! {
        <GameProvider>
            <div class="p-2 flex flex-col gap-4 items-center">
                <Players />
                <Board />
            </div>
        </GameProvider>
    }
}
