use chrono::offset;
use rand::prelude::*;
use std::rc::Rc;
use yew::Reducible;

use crate::constants::{ANIMALS_COUNT, COLORS, DISNEY_COUNT, NBA_LOGOS};

static CARDS: i32 = 24;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CardType {
    Colors,
    NBA,
    Animals,
    Disney,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct GameSetup {
    pub score_type: ScoreType,
    pub mode: GameMode,
    pub card_type: CardType,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ScoreType {
    Time { started_at: Option<i64> },
    Hits { point_per_hit: i32 },
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum GameMode {
    SinglePlayer,
    MultiPlayer,
}

#[derive(Default, Clone, Copy, Debug, Eq)]
pub struct Card {
    pub id: i32,
    pub value: i32,
    pub flipped: bool,
}

impl PartialEq for Card {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Player {
    pub name: &'static str,
    pub points: i32,
}

impl Player {
    fn new(name: &'static str) -> Self {
        Self { name, points: 0 }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Game {
    pub game_over: bool,
    pub points_type: ScoreType,
    pub mode: GameMode,
    pub guess: (Option<usize>, Option<usize>),
    pub turn: usize,
    pub players: Vec<Player>,
    pub cards: Vec<Card>,
    pub card_type: CardType,
}

pub enum Action {
    FlipCard(usize),
    NextTurn,
    Restart,
}

impl Reducible for Game {
    type Action = Action;

    fn reduce(self: Rc<Self>, action: Self::Action) -> Rc<Self> {
        let mut state = self.as_ref().clone();

        let next = match action {
            Action::FlipCard(position) => {
                let card = &state.cards[position];

                state.points_type = match state.points_type {
                    ScoreType::Time { started_at: None } => ScoreType::Time {
                        started_at: Some(offset::Local::now().timestamp()),
                    },
                    _ => state.points_type,
                };

                let players_with_points = self
                    .players
                    .iter()
                    .filter(|player| player.points > 0)
                    .collect::<Vec<_>>()
                    .len();

                // Reset players points when starting a new round.
                if players_with_points == self.players.len() {
                    if let ScoreType::Time { .. } = state.points_type {
                        state
                            .players
                            .iter_mut()
                            .for_each(|player| player.points = 0);
                    }
                }

                let player = &mut state.players[self.turn];

                if card.flipped {
                    return self;
                }

                let is_correct_guess = match state.guess {
                    (None, None) => {
                        state.guess.0 = Some(position);
                        let card = &mut state.cards[position];
                        card.flipped = true;

                        None
                    }
                    (Some(first_pos), None) => {
                        let first_value = state.cards[first_pos].value;
                        let second = &mut state.cards[position];

                        second.flipped = true;

                        if first_value == second.value {
                            state.game_over = state
                                .cards
                                .iter()
                                .filter(|card| !card.flipped)
                                .collect::<Vec<_>>()
                                .is_empty();

                            state.guess = (None, None);

                            Some(true)
                        } else {
                            state.guess.1 = Some(position);

                            Some(false)
                        }
                    }
                    (Some(first_pos), Some(second_pos)) => {
                        state.cards.iter_mut().enumerate().for_each(|(i, card)| {
                            if i == first_pos || i == second_pos {
                                card.flipped = false;
                            }
                        });

                        state.guess = (Some(position), None);

                        let card = &mut state.cards[position];
                        card.flipped = true;

                        None
                    }
                    _ => None,
                };

                let mut next_points: Option<i32> = None;
                let mut next_turn: Option<bool> = None;

                match state.points_type {
                    ScoreType::Time {
                        started_at: Some(started_at),
                    } => {
                        if state.game_over {
                            let now = offset::Local::now().timestamp();
                            next_points = Some((now - started_at) as i32);

                            if let GameMode::MultiPlayer = state.mode {
                                next_turn = Some(true);
                            }
                        }
                    }
                    ScoreType::Hits {
                        point_per_hit: points_per_hit,
                    } => {
                        if is_correct_guess.is_some() {
                            if let Some(true) = is_correct_guess {
                                next_points = Some(player.points + points_per_hit);
                            } else if let GameMode::MultiPlayer = state.mode {
                                next_turn = Some(true);
                            }
                        }
                    }
                    _ => {}
                };

                if let Some(points) = next_points {
                    player.points = points;
                }

                if next_turn.is_some() {
                    state.turn = (state.turn + 1) % self.players.len();
                }

                if state.game_over {
                    state.points_type = match state.points_type {
                        ScoreType::Time {
                            started_at: Some(_),
                        } => ScoreType::Time { started_at: None },
                        _ => state.points_type,
                    };
                }

                state
            }
            Action::NextTurn => {
                if let (Some(first_pos), Some(second_pos)) = state.guess {
                    state.guess = (None, None);
                    state
                        .cards
                        .iter_mut()
                        .enumerate()
                        .filter(|(pos, _)| *pos == first_pos || *pos == second_pos)
                        .for_each(|(_, card)| {
                            card.flipped = false;
                        });
                };

                state
            }
            Action::Restart => {
                if !state.game_over {
                    return state.into();
                }

                return Game {
                    game_over: false,
                    cards: get_cards(get_cards_count(state.card_type)),
                    ..state
                }
                .into();
            }
        };

        next.into()
    }
}

fn get_cards(total: i32) -> Vec<Card> {
    let mut cards = (1..=total)
        .map(|value| Card {
            id: value,
            value: ((value as f32 / 2.0).ceil() as i32) - 1,
            flipped: false,
        })
        .collect::<Vec<Card>>();

    let mut rng = rand::thread_rng();

    cards.shuffle(&mut rng);
    cards.shuffle(&mut rng);

    cards
}

pub fn get_board_grid(card_type: CardType) -> (i32, i32) {
    match card_type {
        CardType::NBA => (8, 5),
        CardType::Colors => (6, 4),
        CardType::Animals => (8, 5),
        CardType::Disney => (8, 5),
    }
}

fn get_cards_count(card_type: CardType) -> i32 {
    let count = match card_type {
        CardType::NBA => NBA_LOGOS.len() as i32,
        CardType::Colors => COLORS.len() as i32,
        CardType::Animals => ANIMALS_COUNT,
        CardType::Disney => DISNEY_COUNT,
    };

    // let count = count as i32 * 2;
    // let cols = (count as f32).sqrt().floor() as u32;
    // let rest = count - cols.pow(cols) as i32;
    // let rows = rest / 2;

    count * 2
}

impl Game {
    fn default(card_type: CardType) -> Self {
        let cards_count = get_cards_count(card_type);

        Self {
            game_over: false,
            points_type: ScoreType::Hits { point_per_hit: 1 },
            mode: GameMode::SinglePlayer,
            guess: (None, None),
            players: vec![Player::new("Jogador 1")],
            turn: 0,
            cards: get_cards(cards_count),
            card_type,
        }
    }

    pub fn with_single_player_points(card_type: CardType) -> Self {
        Self {
            points_type: ScoreType::Hits { point_per_hit: 1 },
            mode: GameMode::SinglePlayer,
            players: vec![Player::new("Jogador 1")],
            ..Self::default(card_type)
        }
    }

    pub fn with_single_player_time(card_type: CardType) -> Self {
        Self {
            points_type: ScoreType::Time { started_at: None },
            mode: GameMode::SinglePlayer,
            players: vec![Player::new("Jogador 1")],
            ..Self::default(card_type)
        }
    }

    pub fn with_multi_player_points(card_type: CardType) -> Self {
        Self {
            points_type: ScoreType::Hits { point_per_hit: 1 },
            mode: GameMode::MultiPlayer,
            players: vec![Player::new("Jogador 1"), Player::new("Jogador 2")],
            ..Self::default(card_type)
        }
    }

    pub fn with_multi_player_time(card_type: CardType) -> Self {
        Self {
            points_type: ScoreType::Time { started_at: None },
            mode: GameMode::MultiPlayer,
            players: vec![Player::new("Jogador 1"), Player::new("Jogador 2")],
            ..Self::default(card_type)
        }
    }
}
