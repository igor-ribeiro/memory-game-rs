use crate::components::board::Board;
use crate::components::game_provider::GameProvider;
use crate::components::game_setup::context::GameSetupContext;
use crate::components::game_setup::form::GameSetupForm;
use crate::components::game_setup::provider::{use_game_setup, GameSetupProvider};
use crate::components::players::Players;
use yew::prelude::*;

#[function_component(App)]
pub fn app() -> Html {
    html! {
        <GameSetupProvider>
            <Screen />
        </GameSetupProvider>
    }
}

#[function_component(Screen)]
pub fn screen() -> Html {
    let GameSetupContext { setup, .. } = use_game_setup();

    let has_setup =
        setup.game_mode.is_some() && setup.score_type.is_some() && setup.card_type.is_some();

    html! {
        if has_setup {
            <div class="grid grid-cols-[150px_1fr] h-full">
                <GameProvider>
                    <Players />
                    <Board />
                </GameProvider>
            </div>
        } else {
            <GameSetupForm />
        }
    }
}
