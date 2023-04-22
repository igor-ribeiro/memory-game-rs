use crate::{
    components::{card::Card, game_provider::GameContext},
    game::Action,
    hooks::use_reset_guess,
};
use yew::prelude::*;

#[function_component(Board)]
pub fn board() -> Html {
    let game = use_context::<GameContext>().unwrap();

    use_reset_guess();

    let board = game.cards.iter().enumerate().map(|(position, card)| {
        let on_flip = {
            let game = game.clone();
            Callback::from(move |pos: usize| game.dispatch(Action::OpenCard(pos)))
        };

        let mut is_flipped = game.opened.contains_key(&position);

        if let Some(pos) = game.guess.0 {
            if pos == position {
                is_flipped = true;
            }
        }

        if let Some(pos) = game.guess.1 {
            if pos == position {
                is_flipped = true;
            }
        }

        html! {
            <Card
                key={card.id}
                card={*card}
                {on_flip}
                {is_flipped}
                {position}
            />
        }
    });

    html! {
        <div class="grid grid-cols-[repeat(4,100px)] gap-2">
            {for board}
        </div>
    }
}
