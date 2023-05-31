use yew::prelude::*;

use crate::{
    components::game_setup::{
        context::{GameSetupContext, GameSetupField},
        provider::use_game_setup,
    },
    game::GameMode,
    utils::is_option_value,
};

#[function_component(GameModeInput)]
pub fn game_mode_input() -> Html {
    let GameSetupContext { setup, set, .. } = use_game_setup();

    let on_set_value = {
        Callback::from(move |field| {
            set.emit(field);
        })
    };

    let is_single_player = is_option_value(&setup.game_mode, &GameMode::SinglePlayer);
    let is_multi_player = is_option_value(&setup.game_mode, &GameMode::MultiPlayer);

    let set_single_player =
        on_set_value.reform(move |_| GameSetupField::Mode(GameMode::SinglePlayer));

    let set_multi_player =
        on_set_value.reform(move |_| GameSetupField::Mode(GameMode::MultiPlayer));

    html! {
        <div class="text-center flex flex-col items-center">
            <h2 class="font-bold text-xl">{"Jogar sozinho"}</h2>
            <div class="btn-group btn-group-responsive">
                <button
                    type="button"
                    data-active={is_single_player.to_string()}
                    onclick={set_single_player}
                >
                    {"Sim"}
                </button>
                <button
                    type="button"
                    data-active={is_multi_player.to_string()}
                    onclick={set_multi_player}
                >
                    {"Não"}
                </button>
            </div>
        </div>
    }
}
