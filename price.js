
/**
 * JavaScript中浮点数作运算时会不精确,如6*0.8=4.800000000000001。
 * 因此计算时先放大10的n次方倍,计算后再除以10的n次方。
 * 在没有找到其他方法之前，这种处理方法还比较有效。
 */

/**
 * 校验是否为金额
 * @param notes 名称
 * @param name 控件的name
 * @return {Boolean} true:正确金额 false:格式不正确
 */
function isPrice(notes,name)
{
	reg=/(^[1-9]{1}\d*(\.\d{1,3})?$)|(^0(\.\d{1,3})?$)/;
	var value="";
	if($("[name='+"+name+"+']")){
		value = $("[name='+"+name+"+']").val();
	}else{
		value = $(name).value;
	}
	if(reg.test(value)==false )
	{
		$error("对不起，"+notes+"不是正确的价格，请重新输入");
		if(name != null || name != 0)
			focusMe(name);
		return false;
	}
	return true;
}

function floatIsMoney(f){
	reg=/(^[1-9]{1}\d*(\.\d{1,3})?$)|(^0(\.\d{1,3})?$)/;
	return reg.test(f);
}

/**
 * 得到价格的精度.
 * @param value   字符串,浮点数都可以
 * @returns {Number} 整数返回1,有一位小数返回0.1,两位小数返回0.01,依次类推.如果不是合法的金额则返回0
 */
function getUnitOfPrice(f) {
	return 1/Math.pow(10, getDecimaDigits(f));
}

/**
 * 获得浮点数小数点的位数,输入的参数必须是格式正确的浮点数
 * @param f
 * @returns
 */
function getDecimaDigits(f) {
	ix = String(f).indexOf(".");
	if (ix > 0) { //小数点后位数
	   decimaDigits = String(f).length - ix -1;
	}
	else {
	   decimaDigits = 0;
	}
	return decimaDigits;
}

/**
 * 根据步长取余数
 * @param f1
 * @param f2
 * @param addUnit
 * @returns
 */
function getRemainder(f1, f2, addUnit) {
	
	d1 = getDecimaDigits(f1);
	d2 = getDecimaDigits(f2);
	d3 = getDecimaDigits(addUnit);
	
	var maxTime = Math.max(Math.max(d1,d2),d3);
	
	var num1 = new Number(XtenTimesOf(f1,maxTime));
	var num2 = new Number(XtenTimesOf(f2,maxTime));
	
	
	
	var addUnit3 = new Number(XtenTimesOf(addUnit,maxTime));
	//alert("num1="+num1+" num2="+num2 +"addUnit3="+ addUnit3);
	//不知道这里的Math.pow可靠不
	return new Number(((num1 - num2) % addUnit3)/Math.pow(10, maxTime)).toFixed(maxTime);
	
}


/**
 * 这个方法 替代Math.pow(); 因为调用Math.pow()发现结果也不可靠。
 * @param num 
 * @param xTime  倍
 * @returns num 乘10的xtime幂
 */
function XtenTimesOf(num , xTime)
{
	var numStr = ""+num+"";
	//小数点的位置
	var dotPos = numStr.indexOf(".");
	
	if(dotPos == -1){//如果没有小数点，补xtime个零后返回
		for(var i = 0;i < xTime;i++){
			numStr = numStr+"0";
		}
		return numStr; 
	}
	else
	{	//num的长度
		var numLen = numStr.length;
		if(numLen-1 < dotPos+xTime)
		{
			numStr = numStr.replace(".", "");
			for(var i = 0;i < xTime+dotPos-numLen+1;i++){
				numStr = numStr+"0";
			}
			return numStr; 
		}else{
			numStr = numStr.replace(".", "");
			var subStr = numStr.slice(0, xTime+dotPos);
			numStr = numStr.replace(subStr, subStr+".");
			return numStr;
		}
		
	}
	return null;
}

/**
 * 两个浮点数相减
 * @param f1
 * @param f2
 * @returns
 */
function subfloat(f1, f2) {
	return opfloat(f1, f2, '-');
}

/**
 * 两个浮点数相加
 * @param f1
 * @param f2
 * @returns
 */
function addfloat(f1, f2) {
	return opfloat(f1, f2, '+');
}

/**
 * 两个浮点数相乘
 * @param f1
 * @param f2
 * @returns
 */
function mulfloat(f1, f2) {
	return opfloat(f1, f2, '*');
}
/**
 * 两浮点数相除
 * @param f1
 * @param f2
 * @returns
 */
function divfloat(f1, f2) {
	return opfloat(f1, f2, '/');
}
/**
 * 获得浮点数小数点的位数,输入的参数必须是格式正确的浮点数
 * @param f
 * @param f
 * @param op 操作符 加+ 减- 乘* 除 /
 * @returns 返回结果
 */
function opfloat(f1, f2, op) {
	d1 = getDecimaDigits(f1);
	d2 = getDecimaDigits(f2);
	var num1 = new Number(XtenTimesOf(f1,Math.max(d1,d2)));
	var num2 = new Number(XtenTimesOf(f2,Math.max(d1,d2)));
	switch(op) {
	   case '+' : return new Number((num1 + num2) / Math.pow(10, Math.max(d1,d2))).toFixed(Math.max(d1, d2));
	   case '-' : return new Number((num1 - num2) / Math.pow(10, Math.max(d1,d2))).toFixed(Math.max(d1, d2));
	   case '*' : {
		   var tempResult = new Number((num1 * num2) / Math.pow(10, 2*Math.max(d1,d2))).toFixed(Math.max(d1, d2));
		   return trimZero(tempResult);
	   }
	   case '/' : {
		   var tempResult = new Number(num1 / num2).toFixed(Math.max(d1, d2,2));
		   return trimZero(tempResult);
	   }
	}
	return 0;
}
/**
 * 将数字小数点后面的0去除,暂只支持两位精度
 */
var trimZero = function(tempResult){
	if(/\d+\.00*$/.test(tempResult)){return tempResult.replace(/\.0+/, "");}
		else if(/\d+\.\d00?$/.test(tempResult)){return tempResult.replace(/(\.[^0]*)0+/, "$1");}
			return tempResult;
};

/**
 * 获得浮点数小数点的位数,输入的参数必须是格式正确的浮点数
 * @param f
 * @returns
 */
function getDecimaDigits(f) {
	ix = String(f).indexOf(".");
	if (ix > 0) { //小数点后位数
	   decimaDigits = String(f).length - ix -1;
	}
	else {
	   decimaDigits = 0;
	}
	return decimaDigits;
}