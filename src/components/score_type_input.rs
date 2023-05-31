use strum::IntoEnumIterator;
use yew::prelude::*;

use crate::{
    components::game_setup::{
        context::{GameSetupContext, GameSetupField},
        provider::use_game_setup,
    },
    game::ScoreType,
    utils::is_option_value,
};

fn get_label(score_type: ScoreType) -> String {
    match score_type {
        ScoreType::Hits { .. } => "Pontos",
        ScoreType::Time { .. } => "Tempo",
    }
    .to_string()
}

#[function_component(ScoreTypeInput)]
pub fn game_mode_input() -> Html {
    let GameSetupContext { setup, set, .. } = use_game_setup();

    let score_types = ScoreType::iter().map(|score_type| {
        let set = set.clone();

        let on_set_value = {
            Callback::from(move |_| {
                set.emit(GameSetupField::Score(score_type));
            })
        };

        let is_selected = is_option_value(&setup.score_type, &score_type);

        html! {
            <button
                type="button"
                data-active={is_selected.to_string()}
                onclick={on_set_value}
            >
                {get_label(score_type)}
            </button>
        }
    });

    html! {
        <div class="text-center flex flex-col items-center">
            <h2 class="font-bold text-xl">{"Tipo de pontuação"}</h2>
            <div class="btn-group btn-group-responsive">
                {for score_types}
            </div>
        </div>
    }
}
