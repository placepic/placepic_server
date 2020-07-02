module.exports ={
    stationSort: (data)=>{
        const sortingData = data.reduce((ret, {subwayName, subwayLine})=>{
            if(ret[subwayName]){
                ret[subwayName].push(subwayLine);
            }else{
                ret[subwayName] = [subwayLine];
            }
            return ret;
        },{});  
        const result = Object.entries(sortingData).reduce((arr,[subwayName,subwayLine])=>{
            arr.push({subwayName,subwayLine});
            return arr;
        }, []);
        return result;
    }
}