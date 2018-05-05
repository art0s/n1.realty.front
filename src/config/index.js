///////////////////////////////////////////////////////////////////////////////
export const CITY_ID = 'abakan';
export const CITY_NAME = 'Абакан';
export const CITY_NAME_2 = 'Абакана';
export const PAGE_SIZE = 20;
export const SALES = {
	'0': 'Продажа',
	'1': 'Аренда',
	'2': 'Покупка',
	'3': 'Съем в аренду'
};
export const SALES_BALLOON = {
	'0': 'Продается',
	'1': 'Сдается в аренду',
	'2': 'Покупается',
	'3': 'Снимается в аренду'
};
export const ESTATES = {
	'Квартира': 'Квартира',
	'Жилье на земле': 'Жилье на земле',
	'Квартира посуточно': 'Квартира посуточно',
	'Коммерческая': 'Коммерческая',
	'Гаражи': 'Гаражи'
};
export const ROOMS = {
	'?': 'Не указано',
	'1': 'Одна комната',
	'2': 'Две комнаты',
	'3': 'Три комнаты',
	'4': 'Четыре и более комнат'
};

export const YandexMAP = {
	abakan: {
		state: {
			center: [53.72,91.44],
			zoom: 13,
			controls: ['geolocationControl', 'zoomControl', 'fullscreenControl', 'rulerControl'],
			behaviors: ['drag', 'dblClickZoom']
		},
		options: {
			maxZoom: 16
		}
	},
	kyzyl: {
		state: {
			center: [51.72,94.44],
			zoom: 12,
			controls: ['geolocationControl', 'zoomControl', 'fullscreenControl', 'rulerControl'],
			behaviors: ['drag', 'dblClickZoom']
		},
		options: {
			maxZoom: 16
		}
	}
}
export const API_URL = 'https://api.n1.realty';
///////////////////////////////////////////////////////////////////////////////
