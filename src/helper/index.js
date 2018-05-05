///////////////////////////////////////////////////////////////////////////////
import * as CONSTANTS from '../config';
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
		if (!obj || !obj.sale) return 'договорная';

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

		if (isNaN(_price)) return 'договорная';

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
	},

	//=========================================================================
	formatAdresValue(obj) {
		if (!obj || !obj.street) return false;

		let _adres = [];
		_adres.push('ул. ' + obj.street.trim());
		if (obj.house_no) _adres.push('д. ' + obj.house_no);

		return _adres.join(', ');
	},

	//=========================================================================
	formatSquareValue(obj) {
		if (!obj || !obj.total_floor_space) return false;

		return String(obj.total_floor_space).trim() + ' кв.м.';
	},

	//=========================================================================
	balloonInfo(obj) {
		if (!obj) return '';

		let _room = obj.room_quantity ? String(obj.room_quantity) : '?';
		let _roomValue = parseInt(_room, 10);
		if (isNaN(_roomValue) || _roomValue <= 0) _room = '';
		else if (_roomValue === 1) _room = ', одна комната';
		else if (_roomValue === 2) _room = ', две комнаты';
		else if (_roomValue === 3) _room = ', три комнаты';
		else if (_roomValue >= 4) _room = ', 4 и более комнат';

		let answer = '<span class="balloon-link" data-path="/view/' + obj.dbname + '/' + obj.id + '">' + CONSTANTS.SALES_BALLOON[obj.sale] + ' ' + String(obj.estate_type).toLowerCase() + ' (' + this.formatSquareValue(obj) + _room + ')</span>';
		answer += '<br>' + this.formatPriceValue(obj);

		return answer;
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Helper;
///////////////////////////////////////////////////////////////////////////////