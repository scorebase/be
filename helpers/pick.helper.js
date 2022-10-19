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

    if((resultDiff * pickDiff) <= 0 && (resultDiff !== pickDiff)) {
        points = POINTS_SYSTEM.wrong;
    } else {
        const closeIndex = Math.abs(
            Math.abs(home_result - away_result) - Math.abs(home_pick - away_pick)
        ) +
            Math.abs(home_pick + away_pick - home_result - away_result) / 2;
        if(closeIndex === 0) {
            points = POINTS_SYSTEM.exact;
            type = 'exact';
        } else if(closeIndex <= 1.5) {
            points = POINTS_SYSTEM.close;
            type = 'close';
        } else {
            points = POINTS_SYSTEM.result;
            type = 'result';
        }
    }

    return { points, type };
};
