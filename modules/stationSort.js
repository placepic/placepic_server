module.exports = {
    stationSort: (data) => {
        const sortingData = data.reduce((ret, { subwayIdx, subwayName, subwayLine }) => {
            if (ret[subwayName]) {
                ret[subwayName].push(subwayLine);
            } else {
                ret[subwayName] = [subwayIdx];
                ret[subwayName].push(subwayLine);
            }
            return ret;
        }, {});
        const result = Object.entries(sortingData).reduce((arr, [subwayName, subwayLine]) => {
            let subwayIdx = subwayLine[0];
            subwayLine.shift();
            arr.push({ subwayIdx: subwayIdx, subwayName, subwayLine });
            return arr;
        }, []);
        return result;
    },
};
