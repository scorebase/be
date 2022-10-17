const POINTS_SYSTEM = {
    exact : 10,
    close : 5,
    result : 2,
    wrong : 0
};

module.exports.calculatePickResult = (home_pick, away_pick, home_result, away_result) => {
    let points = 0;
    const resultDiff = home_result - away_result;
    const pickDiff = home_pick - away_pick;
    let type = '';

    if(home_pick === home_result && away_pick === away_result) {
        points = POINTS_SYSTEM.exact;
        type = 'exact';
    } else if((resultDiff * pickDiff) <= 0 && (resultDiff !== pickDiff)) {
        points = POINTS_SYSTEM.wrong;
    } else {
        points = POINTS_SYSTEM.result;
        type = 'result';

        if(pickDiff === 0 && resultDiff === 0) {
            if(Math.abs((home_result + away_result) - (home_pick + away_pick)) === 2) {
                points = POINTS_SYSTEM.close;
                type = 'close';
            }
        } else {
            if((home_pick === home_result && (Math.abs(away_pick - away_result) === 1))) {
                points = POINTS_SYSTEM.close;
                type = 'close';
            } else if((away_pick === away_result && (Math.abs(home_pick - home_result) === 1))) {
                points = POINTS_SYSTEM.close;
                type = 'close';
            }
        }
    }

    return { points, type };
};
