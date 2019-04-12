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
    //load data in crossfilter
    var ndx = crossfilter(salaryData);
    
    //Data read in treats the salary column as text
    salaryData.forEach(function(d){
        d.salary = parseInt(d.salary);
    })
    
    //pass ndx variable to function
    show_discipline_selector(ndx);
    show_gender_balance(ndx);
    show_average_salaries(ndx);
    show_rank_distribution(ndx);
    
    //Render the chart
    dc.renderAll();
}


function show_discipline_selector(ndx){
    
    dim = ndx.dimension(dc.pluck("discipline"));
    
    group = dim.group();
    
    dc.selectMenu("#discipline-selector")
        .dimension(dim)
        .group(group);
}


function show_gender_balance(ndx){
    //Create dimension and pluck data
    var dim = ndx.dimension(dc.pluck("sex"));
    
    //Create group
    var group = dim.group();
    
    //Render barChart on ID
    dc.barChart("#gender-balance")
        .width(400)
        .height(300)
        .margins({top:10, right:50, bottom: 30, left: 50})
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        //.elasticY(true) causing problem with selectMenu
        .xAxisLabel("Gender")
        .yAxis().ticks(20);
}

function show_average_salaries(ndx){
    //Calculate and show average salaries per sex with custom reducer
    var dim = ndx.dimension(dc.pluck("sex"));
    var group = dim.group();
    
    function add_item(p, v){
        p.count++;
        p.total += v.salary;
        p.average = p.total / p.count;
        return p;
    }
    
    function remove_item(p, v){
        p.count--;
        if( p.count == 0 ){
            p.total = 0;
            p.average = 0;
        } else{
            p.total -= v.salary;
            p.average = p.total / p.count;
        }
        return p;
        
    }
    
    function initialise(){
        return {count: 0, total: 0, average: 0};
    }
    
    var averageSalaryByGender = dim.group().reduce(add_item, remove_item, initialise);
    
    
    dc.barChart("#average-salary")
        .width(400)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dim)
        .group(averageSalaryByGender)
        //When using custom reducer need to use valueAccessor
        .valueAccessor(function(d){
            //round number to 2 decimal
            return d.value.average.toFixed(2);
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Average salary")
        .yAxis().ticks(4); 
}


function show_rank_distribution(ndx) {
    var  dim = ndx.dimension(dc.pluck('sex'));

/* specific to prof
    var profByGender = dim.group().reduce(
        function (p, v) {
            p.total++;
            if(v.rank == "Prof") {
                p.match++;
            }
            return p;
        },
        function (p, v) {
            p.total--;
            if(v.rank == "Prof") {
                p.match--;
            }
            return p;
        },
        function () {
            return {total: 0, match: 0};
        }
    );
*/

//Generic function
    function rankByGender (dimension, rank) {
        //Used reduce internall above used externally
        return dimension.group().reduce(
            function (p, v) {
                p.total++;
                if(v.rank == rank) {
                    p.match++;
                }
                return p;
            },
            function (p, v) {
                p.total--;
                if(v.rank == rank) {
                    p.match--;
                }
                return p;
            },
            function () {
                return {total: 0, match: 0};
            }
        );
    }

    var profByGender = rankByGender(dim, "Prof");
    var asstProfByGender = rankByGender(dim, "AsstProf");
    var assocProfByGender = rankByGender(dim, "AssocProf");
    
    console.log(profByGender.all());
    
        dc.barChart("#rank-distribution")
        .width(400)
        .height(300)
        .dimension(dim)
        .group(profByGender, "Prof")
        .stack(asstProfByGender, "Asst Prof")
        .stack(assocProfByGender, "Assoc Prof")
        //Use valueAccessor when using custom reducer
        .valueAccessor(function(d) {
            if(d.value.total > 0) {
                return (d.value.match / d.value.total) * 100;
            } else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({top: 10, right: 100, bottom: 30, left: 30})
        .xAxisLabel("Rank");
    
}