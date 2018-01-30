///////////////////////////////////////////////////////////////////////////////
const Helper = {
	//=========================================================================
	strCapitalize(str) {
		return str && str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	},

	//=========================================================================
	formatDate(date) {
		if (!date) return '';
		date = String(date);
		if (!/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(date)) return date;

		return date.substr(8, 2) + '.' + date.substr(5, 2) + '.' + date.substr(0, 4);
	},

	//=========================================================================
	formatPriceValue(obj) {
		// нормализуем значение стоимости объекта
		if (!obj || !obj.sale) return 'без стоимости';

		let _price = false;
		let _ed = 'руб.';
		// если это продажа
		if (String(obj.sale) === '0')
		{
			_price = parseFloat(obj.price);
			_ed = 'тыс. руб.';
		}
		// если это аренда
		else if (String(obj.sale) === '1')
		{
			_price = parseFloat(obj.rent_price_month);
		}

		if (isNaN(_price)) return 'без стоимости';

		return _price.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + _ed;
	},

	//=========================================================================
	formatRoomValue(value) {
		// нормализуем значение количества комнат
		let _room = value ? String(value) : '?';
		let _roomValue = parseInt(_room, 10);
		if (isNaN(_roomValue) || _roomValue <= 0) _room = '?';
		if (_roomValue >= 4) _room = '4+';
		return _room;
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Helper;
///////////////////////////////////////////////////////////////////////////////