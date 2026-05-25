
/*
 * Complete the 'numSubarrays' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts following parameters:
 *  1. INTEGER_ARRAY arr
 *  2. INTEGER minLen
 *  3. LONG_INTEGER threshold
 */

function numSubarrays(arr, minLen, threshold) {
    let subArrsFound = 0;
    let startingIndex = 0; 
    
    //Loops through array
    for(let i = startingIndex; i< arr.length; i+=1){
    
        //loops through sub-arrays
        let sumOfSubEls = 0;
        let countOfSubEls = 0;
        let subArrIndex = i;
        
    
        while((((sumOfSubEls + arr[subArrIndex])<=threshold) || (subArrIndex - startingIndex) < minLen ) && subArrIndex < arr.length){
            sumOfSubEls+=arr[subArrIndex];    
            subArrIndex = i+1; 
            countOfSubEls +=1;
            console.log(subArrIndex);
        }
        
        startingIndex = subArrIndex;
        
        if(subArrIndex == arr.length){
            continue;
        }
        subArrsFound +=1;
    }
    
    return subArrsFound;

}


let arr = [1,2,3,4];
let minLen = 2;
let threshold = 4;

return numSubarrays(arr, minLen, threshold);
