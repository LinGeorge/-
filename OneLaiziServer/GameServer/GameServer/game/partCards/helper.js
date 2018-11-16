
var helper = {};

helper.copyObj = function(obj){
    var getType = Object.prototype.toString;
    if(getType.call(obj) == "[object Array]"){
        var copy_obj = [];
        for(var k in obj){
            copy_obj.push(obj[k]);
        }
        return copy_obj
    }else if(getType.call(obj) == "[object Object]"){
        var copy_obj = {};
        for(var k in obj){
            copy_obj[k] = obj[k];
        }
        return copy_obj;
    }
    return obj
}

module.exports = helper;
