var Crawler = require("crawler");
var MatchDb = require('./MatchDb');

var c = new Crawler({
    maxConnections : 2,
    //This is called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        } else {
            var $ = res.$;
            //Get the match teams and percentage predictions
            var list = [];
            $(".tip").each(function (index, element){
                var match = $(element).attr("title").split("-");
                list.push(match);
            });

            // Get the match statuses e.g FT- FullTime PP- PostPoned etc
            // The statuses are in a span with class = "tac nowrap hidden-phone"
            var isPlayed = [];
            $(".tac.nowrap.hidden-phone").each(function (index, element){
                var match_status =$("span",element).text();
                isPlayed.push(match_status);
            });
          
            // Get the match dates
            // Match dates are in a span with attribute data-date
            var matchDates = [];
            $("[data-date]").each(function (index, element){
                var match_day =$(element).text();
                matchDates.push(match_day);
            });
            
            // Get the match resuts for games which have been played
            // Match results are in a href with tile containing 'Results' for matches
            //   played and 'Preview' for matches not yet played           
            var matchResults = [];
            $("a[title*=Results], a[title*=Preview]").each(function (index, element){
               var match_result =$("strong",element).text();
               matchResults.push(match_result);
            });
            
            //store the results to a database
            pushDb(4,list,isPlayed,matchDates,matchResults);
        }
        done();
    }
});


c.queue('https://www.scibet.com/football/germany/bundesliga-2/');

function pushDb(_league_id,_list, _isPlayed, _matchDates, _matchResults){
    //Go through the lists extracting information in an orderly fashion
    //Each extracion point is stored in an object 'match' which will be pushed to DB helper for saving
    for(var i=0; i<_list.length; i++){
        match = {};
        if (typeof _list[i][0] != 'undefined') {
            home_team_chances =_list[i][0].split('%');
            if(home_team_chances.length > 1){
                match.home_team = home_team_chances[1].trim();
                match.prediction_home_team = home_team_chances[0].trim();
            } else {
                console.log('undefined seperator % on home_team_chances');
                match.home_team = '';
                match.prediction_home_team = '';
            }
        } else {
            console.log('undefined object _list[i][0]');
            match.home_team = '';
            match.prediction_home_team = '';
        }

        if (typeof _list[i][1] != 'undefined') {
            match.prediction_draw =_list[i][1].split('%')[0].trim();
        } else {
            console.log('undefined object _list[i][1]');
            match.prediction_draw = '';
        }

        if (typeof _list[i][2] != 'undefined') {
            away_team_chances =_list[i][2].split('%');
            if(away_team_chances.length > 1){
                match.away_team = away_team_chances[1].trim();
                match.prediction_away_team = away_team_chances[0].trim();
            } else {
                console.log('undefined seperator % on away_team_chances');
                match.away_team = '';
                match.prediction_away_team = '';
            }
        } else {
            console.log('undefined object _list[i][2]');
            match.away_team = '';
            match.prediction_away_team = '';
        }
        
        if (typeof _isPlayed[i] != 'undefined') {
            match.current_status = _isPlayed[i];
        } else {
            console.log('undefined _isPlayed');
            match.current_status = '';
        }
        
        if (typeof _matchDates[i] != 'undefined') {
            match.match_date = _matchDates[i];
        } else {
            console.log('undefined  _matchDates');
            match.match_date = '';
        }
        
        if (typeof _matchResults[i] != 'undefined') {
            match_results = _matchResults[i].split('-');
            if(match_results.length > 1){
                match.home_team_score = match_results[0].trim();
                match.away_team_score = match_results[1].trim();
            } else {
                console.log('undefined seperator - on _matchResults');
                match.home_team_score = '';
                match.away_team_score = '';
        }
        } else {
            console.log('_matchResults[i]');
            match.home_team_score = '';
            match.away_team_score = '';
        }
        
        if (typeof _league_id != 'undefined') {
            match.league_id = _league_id;
        } else {
            console.log('undefined  _league_id');
            match.league_id = '0';
        }
     
        console.log(match);
        var matchDb = new MatchDb(match.league_id, match.home_team, match.away_team, match.match_date, match.current_status, match.home_team_score, match.away_team_score, match.prediction_home_team, match.prediction_draw, match.prediction_away_team);
        console.log(matchDb);
        matchDb.saveMatch();
        console.log('Match Saved');
    }
}
