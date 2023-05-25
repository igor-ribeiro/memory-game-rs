use crate::{components::game_provider::GameContext, game::ScoreType};
use yew::prelude::*;

#[function_component(Players)]
pub fn players() -> Html {
    let game = use_context::<GameContext>().unwrap();

    let players = game.players.iter().enumerate().map(|(i, player)| {
        let is_turn = game.turn == i;

        let points = if let ScoreType::Time { started_at } = game.points_type {
            if started_at.is_some() && is_turn {
                "...".to_string()
            } else {
                format!("{}s", player.points)
            }
        } else {
            format!("{}", player.points)
        };

        html! {
            <div
                key={player.name}
                class={classes!(
                    "text-center flex flex-col justify-between relative overflow-hidden".to_string(),
                    is_turn.then_some("font-bold").or(Some("text-gray-600")),
                )}
            >
                <span class="text-sm">
                    {player.name}
                </span>

                <span
                    key={player.points}
                    class="text-3xl animate-[ping_.7s_ease-in-out_1] [animation-direction:reverse]"
                >
                    {points}
                </span>

                <div
                    class={classes!(
                        "z-[-1] w-full h-full absolute left-0 top-0 bg-green-600/20".to_string(),
                        is_turn.then_some("opacity-1").or(Some("opacity-0")),
                    )}
                />
            </div>
        }
    });

    html! {
        <div class="flex flex-col w-full gap-2 bg-blue-300 cartoon p-1">
            {for players}
        </div>
    }
}
