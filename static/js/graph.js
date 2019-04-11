/* Load data with queue.js and check if data is loaded correctly with 
** crossfilter in chrome dev tools as follows:
** 1.Set breakpoint at end of function in js file and reload page
** 2.Create variable i.e. var ndx = crossfilter(salaryData);
** 3.Create dimension to pluck data x from crossfilter i.e. var dim = ndx.dimenstion(dc.pluck("rank")); 
** 4.Create group on dimension i.e. var group = dim.group();
** 5.Output to console i.e. group.all();
**/
queue()
    //(dataTypeToBeloaded, "dataFile")
    .defer(d3.csv, "data/Salaries.csv")
    //after data is loaded call de function makeGraphs
    .await(makeGraphs);
    
function makeGraphs(error, salaryData){
    
}
