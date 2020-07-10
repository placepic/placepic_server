module.exports ={
    stationSort: (data)=>{
        const sortingData = data.reduce((ret, {subwayIdx,subwayName, subwayLineNumber})=>{
            if(ret[subwayName]){
                ret[subwayName].push(subwayLineNumber);
            }else{
                ret[subwayName] = [subwayIdx];
                ret[subwayName].push(subwayLineNumber);
            }
            return ret;
        },{});  
        const result = Object.entries(sortingData).reduce((arr,[subwayName,subwayLine])=>{
            let subwayIdx = subwayLine[0];
            subwayLine.shift();
            arr.push({subwayIdx:subwayIdx,subwayName,subwayLine});
            return arr;
        }, []);
        return result;
    }
}