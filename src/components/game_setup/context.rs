use yew::{Callback, Reducible};

use crate::game::{CardType, GameMode, ScoreType};

#[derive(PartialEq, Eq, Clone, Debug, Copy)]
pub struct GameSetupValue {
    pub game_mode: Option<GameMode>,
    pub score_type: Option<ScoreType>,
    pub card_type: Option<CardType>,
}

pub enum GameSetupField {
    Mode(GameMode),
    Score(ScoreType),
    Card(CardType),
}

pub enum GameSetupAction {
    Reset,
    Set(GameSetupField),
}

impl Reducible for GameSetupValue {
    type Action = GameSetupAction;

    fn reduce(self: std::rc::Rc<Self>, action: Self::Action) -> std::rc::Rc<Self> {
        let mut next = *self.as_ref();

        match action {
            GameSetupAction::Reset => {
                next.score_type = None;
                next.game_mode = None;
                next.card_type = None;
            }
            GameSetupAction::Set(field) => match field {
                GameSetupField::Score(value) => {
                    next.score_type = Some(value);
                }
                GameSetupField::Mode(value) => {
                    next.game_mode = Some(value);
                }
                GameSetupField::Card(value) => {
                    next.card_type = Some(value);
                }
            },
        };

        next.into()
    }
}

#[derive(Clone, PartialEq)]
pub struct GameSetupContext {
    pub setup: GameSetupValue,
    pub reset: Callback<()>,
    pub set: Callback<GameSetupField>,
}
