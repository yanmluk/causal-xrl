const margin = { left: 20, right: 200, top: 20, bottom: 20 };
const boardRect = d3.select("#board_pan").node().getBoundingClientRect();
const width = boardRect.width - margin.left - margin.right;
const height = boardRect.height - margin.top - margin.bottom;
const rows_num = 16;
const cols_num =16;
const board_len = d3.min([width, height]);
// const grid_side_len = board_len/16;
const grid_side_len = 41;
const ut_dct = {0:'NOOP', 1:'move', 2:'harvest', 3:'return', 4:'produce', 5:'attack'}
const drct_dct = {0:'up', 1:'right', 2:'down', 3:'left'}
const prdc_tp_dct = {0:'resource', 1:'base', 2:'barrack', 3:'worker', 4:'light', 5:'heavy', 6:'ranged'} ;
const board_slider_len = 0.8*(boardRect.width);

const unit_color = {light:"#ffc800", heavy:"#ffff00", ranged:"#00ffff", worker:"#808080", barrack:"#808080", base:"#c0c0c0", resource:"#00ff00"}
const path_to_frames = '../static/frames/new/';


let utt_obj;
let uot;
let utt;
let urt;
let uht;
let uat;
let my_uot;
let resource_objs;
let valid_actions;
let hist_positions=[];
let boardstates_log = {};
let unitctf_boardstates_log = {};
let player_urt_log = {};
let unitctf_player_urt_log = {};
let unitctf_unitpos_log = [];
let unit_max_gamestep = -1;
let unit_current_action;
let board_actions_stats;
let board_gini;
let board_entropy;
let board_purity;
let ctf_unit_row;
let ctf_unit_col;

let board_actions;
let board_action_drct;
let board_action_prdc_obj;
let board_action_atk_row;
let board_action_atk_col;

let cached_board_data={"b1":[]};
let cached_board_map_state={};
let downFileName;

let cached_um = {};
let cached_cam = {};

let replay_board_states = [];
let replay_player_urt = [];
let replay_gameSteps;

let nodes_set;
let edges_set;
let effect_set;
let current_state_set;

const case1_step =60;
const case2_step = 392;
