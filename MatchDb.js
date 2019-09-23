const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'db1',
    user: 'sportsbrain',
    password: 'SPORTSbr@1n',
    database: 'sportsbrain'
});

var insert_params = {};

function MatchDb(
    league_id,
    home_team,
    away_team,
    match_date,
    current_status,
    home_team_score,
    away_team_score,
    prediction_home_team,
    prediction_draw,
    prediction_away_team) {
    
    insert_params = {};
    if(league_id!=''){insert_params.league_id = league_id;}
    if(home_team!=''){insert_params.home_team = home_team;}
    if(away_team!=''){insert_params.away_team = away_team;}
    if(match_date!=''){insert_params.match_date = match_date;}
    if(current_status!=''){insert_params.current_status = current_status;}
    if(home_team_score!=''){insert_params.home_team_score = home_team_score;}
    if(away_team_score!=''){insert_params.away_team_score = away_team_score;}
    if(prediction_home_team!=''){insert_params.prediction_home_team = prediction_home_team;}
    if(prediction_draw!=''){insert_params.prediction_draw = prediction_draw;}
    if(prediction_away_team!=''){insert_params.prediction_away_team = prediction_away_team;}
}

MatchDb.prototype.saveMatch = function () {
    //console.log(insert_params);
    var query = connection.query('INSERT INTO predictions SET ?', insert_params, (err, res) => {
        if (err){
           // console.log(query.sql)
            throw err;
        }
    });
}

module.exports = MatchDb;
