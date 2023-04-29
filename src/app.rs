use crate::components::board::Board;
use crate::components::game_provider::GameProvider;
use crate::components::players::Players;
use crate::game::{CardType, GameMode, GameSetup, ScoreType};
use yew::prelude::*;

#[function_component(App)]
pub fn app() -> Html {
    let game_mode = use_state::<Option<GameMode>, _>(|| Some(GameMode::SinglePlayer));
    let score_type =
        use_state::<Option<ScoreType>, _>(|| Some(ScoreType::Hits { point_per_hit: 1 }));
    let card_type = use_state::<Option<CardType>, _>(|| Some(CardType::Animals));
    // let game_mode = use_state::<Option<GameMode>, _>(|| None);
    // let score_type = use_state::<Option<ScoreType>, _>(|| None);
    // let card_type = use_state::<Option<CardType>, _>(|| None);

    let set_game_mode = {
        let game_mode = game_mode.clone();
        Callback::from(move |value: GameMode| {
            game_mode.set(Some(value));
        })
    };

    let set_score_type = {
        let score_type = score_type.clone();
        Callback::from(move |value: ScoreType| {
            score_type.set(Some(value));
        })
    };

    let set_card_type = {
        let card_type = card_type.clone();
        Callback::from(move |value: CardType| {
            card_type.set(Some(value));
        })
    };

    let is_ready = game_mode.is_some() && score_type.is_some() && card_type.is_some();

    if !is_ready {
        return html! {
            <div class="p-2 flex flex-col gap-4 items-center">
                <h1 class="font-bold text-3xl">{"Jogo da memória"}</h1>

                <div class="text-center">
                    <h2 class="font-bold text-xl">{"Jogar sozinho"}</h2>
                    <div class="btn-group">
                        <button
                            class={classes!(
                                "btn",
                                if let Some(GameMode::SinglePlayer) = *game_mode {
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={set_game_mode.clone().reform(move |_| GameMode::SinglePlayer)}
                        >
                            {"Sim"}
                        </button>
                        <div class="btn-group-divider"/>
                        <button
                            class={classes!(
                                "btn",
                                if let Some(GameMode::MultiPlayer) = *game_mode {
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={set_game_mode.clone().reform(move |_| GameMode::MultiPlayer)}
                        >
                            {"Não"}
                        </button>
                    </div>
                </div>

                <div class="text-center">
                    <h2 class="font-bold text-xl">{"Pontuação"}</h2>
                    <div class="btn-group">
                        <button
                            class={classes!(
                                "btn",
                                if let Some(ScoreType::Hits { .. }) = *score_type {
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={set_score_type.clone().reform(move |_| ScoreType::Hits {
                                point_per_hit: 1,
                            })}
                        >
                            {"Acertos"}
                        </button>
                        <div class="btn-group-divider"/>
                        <button
                            class={classes!(
                                "btn",
                                if let Some(ScoreType::Time { .. }) = *score_type{
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={set_score_type.clone().reform(move |_| ScoreType::Time {
                                started_at: None,
                            })}
                        >
                            {"Tempo"}
                        </button>
                    </div>
                </div>

                <div class="text-center">
                    <h2 class="font-bold text-xl">{"Tipo de cartas"}</h2>
                    <div class="btn-group">
                        <button
                            class={classes!(
                                "btn",
                                if let Some(CardType::Colors) = *card_type {
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={set_card_type.clone().reform(move |_| CardType::Colors )}
                        >
                            {"Cores"}
                        </button>
                        <div class="btn-group-divider"/>
                        <button
                            class={classes!(
                                "btn",
                                if let Some(CardType::NBA) = *card_type{
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={set_card_type.clone().reform(move |_| CardType::NBA )}
                        >
                            {"NBA"}
                        </button>
                        <div class="btn-group-divider"/>
                        <button
                            class={classes!(
                                "btn",
                                if let Some(CardType::Animals) = *card_type{
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={set_card_type.clone().reform(move |_| CardType::Animals )}
                        >
                            {"Animais"}
                        </button>
                    </div>
                </div>
            </div>
        };
    }

    let setup = GameSetup {
        mode: game_mode.unwrap(),
        score_type: score_type.unwrap(),
        card_type: card_type.unwrap(),
    };

    let on_reset_setup = {
        let is_single_player = game_mode.clone();
        let score_type = score_type.clone();
        let card_type = card_type.clone();

        move |_| {
            is_single_player.set(None);
            score_type.set(None);
            card_type.set(None);
        }
    };

    html! {
        <GameProvider init={setup}>
            <div class="p-2 flex flex-col gap-2 items-center">
                <Players />
                <Board>
                    <button class="btn" onclick={on_reset_setup}>{"Voltar"}</button>
                </Board>
            </div>
        </GameProvider>
    }
}
