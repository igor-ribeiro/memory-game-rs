use yew::prelude::*;

use crate::components::game_setup::context::{
    GameSetupAction, GameSetupContext, GameSetupField, GameSetupValue,
};

#[hook]
pub fn use_game_setup() -> GameSetupContext {
    use_context::<GameSetupContext>().unwrap()
}

#[derive(Properties, PartialEq)]
pub struct Props {
    pub children: Children,
}

#[function_component(GameSetupProvider)]
pub fn game_setup_provider(Props { children }: &Props) -> Html {
    let setup = use_reducer(|| GameSetupValue {
        game_mode: None,
        card_type: None,
        score_type: None,
    });

    // let setup = use_reducer(|| GameSetupValue {
    //     game_mode: Some(GameMode::MultiPlayer),
    //     card_type: Some(CardType::NbaTeams),
    //     score_type: Some(ScoreType::Hits { point_per_hit: 1 }),
    // });

    let reset = {
        let send = setup.dispatcher();

        use_callback(
            move |_, _| {
                send.dispatch(GameSetupAction::Reset);
            },
            (),
        )
    };

    let set = {
        let send = setup.dispatcher();

        use_callback(
            move |field: GameSetupField, _| {
                send.dispatch(GameSetupAction::Set(field));
            },
            (),
        )
    };

    let context = GameSetupContext {
        setup: *setup,
        reset,
        set,
    };

    html! {
        <ContextProvider<GameSetupContext> context={context}>
            {for children.iter()}
        </ContextProvider<GameSetupContext>>
    }
}
