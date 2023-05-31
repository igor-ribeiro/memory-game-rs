use strum::IntoEnumIterator;
use yew::prelude::*;

use crate::{
    components::game_setup::{
        context::{GameSetupContext, GameSetupField},
        provider::use_game_setup,
    },
    game::CardType,
    utils::is_option_value,
};

fn get_label(card_type: CardType) -> String {
    match card_type {
        CardType::NbaTeams => "NBA",
        CardType::Disney => "Disney",
        CardType::Colors => "Cores",
        CardType::Animals => "Animais",
        CardType::HarryPotter => "Harry Potter",
    }
    .to_string()
}

#[function_component(CardTypeInput)]
pub fn game_mode_input() -> Html {
    let GameSetupContext { setup, set, .. } = use_game_setup();

    let card_types = CardType::iter().map(|card_type| {
        let set = set.clone();

        let on_set_value = {
            Callback::from(move |_| {
                set.emit(GameSetupField::Card(card_type));
            })
        };

        let is_selected = is_option_value(&setup.card_type, &card_type);

        html! {
            <button
                type="button"
                data-active={is_selected.to_string()}
                onclick={on_set_value}
            >
                {get_label(card_type)}
            </button>
        }
    });

    html! {
        <div class="text-center flex flex-col items-center">
            <h2 class="font-bold text-xl">{"Tipo de cartas"}</h2>
            <div class="btn-group btn-group-responsive">
                {for card_types}
            </div>
        </div>
    }
}
