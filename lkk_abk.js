/*
 * lkk_abk.js
 *
 */

var lkk_global_groups = {};
var lkk_global_addrs = [];

var lkk_local_groups = {};
var lkk_local_addrs = [];

(function () {
	var globaladdressbook = false;

	var lkk_groups = lkk_global_groups;
	var lkk_addrs = lkk_global_addrs;

	var Address = {
		to: "",
		to_array: [],
		cc: "",
		cc_array: [],
		bcc: "",
		bcc_array: [],
	};

	function get_address_html() {
		var group_id = $('#lkk_groups').val();
		var contact_ids = undefined;
		if (lkk_groups[group_id] !== undefined) {
			contact_ids = lkk_groups[group_id]["contact_id"];
		}
		// console.log(contact_ids);

		var trs = '<tr><th> </th><th><input type="checkbox" group="all" value="to" id="to_all" /><label for="to_all">To</label><input type="checkbox" group="all" value="cc" id="cc_all" /><label for="cc_all">Cc</label><input type="checkbox" group="all" value="bcc" id="bcc_all" /><label for="bcc_all">Bcc</label></th></tr>';
		var group_id = 0;
		for (var i in lkk_addrs) {
			var contact = lkk_addrs[i];
			var contact_id = contact["contact_id"];
			var contact_name = contact["name"];

			// group member?
			if (contact_ids !== undefined && contact_ids.indexOf(contact_id) < 0) {
				continue;
			}

			var emails = "";
			for (var email_index in contact["email"]) {
				group_id++;

				if (emails) {
					emails += "<br>";
				}

				var email = contact["email"][email_index];
				var regexp = getMatchEmailRegexp(email);
				var status = "";

				status = Address["to"].match(regexp) === null ? '' : 'checked="checked"';
				emails += '<input type="checkbox" group="' + group_id + '" value="to" id="to_' + group_id + '" ' + status + ' /><label for="to_' + group_id + '">To</label>';

				status = Address["cc"].match(regexp) === null ? '' : 'checked="checked"';
				emails += '<input type="checkbox" group="' + group_id + '" value="cc" id="cc_' + group_id + '" ' + status + ' /><label for="cc_' + group_id + '">Cc</label>';

				status = Address["bcc"].match(regexp) === null ? '' : 'checked="checked"';
				emails += '<input type="checkbox" group="' + group_id + '" value="bcc" id="bcc_' + group_id + '" ' + status + ' /><label for="bcc_' + group_id + '">Bcc</label>';

				emails += ' <span class="email" group="' + group_id + '" contact_id="' + contact_id + '" email_index="' + email_index + '">' + email + '</span>';
				// console.log(emails);
			}
			trs += '<tr><td class="contact_name">' + contact_name + '</td><td>' + emails + '</td></tr>';
		}
		var table = '<table>' + trs + '</table>';
		return table;
	}

	function getMatchEmailRegexp(email) {
		return new RegExp('([\\s<,;:]+|^)(' + email.replace(".", "\\.") + ')([\\s>,;:]+|$)', 'i');
	}

	function get_area_html() {
		var options = '';
		if (globaladdressbook) {
			options += '<option value="global">' + rcmail.gettext('global', 'lkk_addressbook') + '</option>';
		}
		options += '<option value="local">' + rcmail.gettext('local', 'lkk_addressbook') + '</option>';
		return '<select id="lkk_area">' + options + '</select>';
	}

	function get_group_html() {
		var options = '<option value="0">' + rcmail.gettext('all', 'lkk_addressbook') + '</option>';
		for (var id in lkk_groups) {
			// console.log(lkk_groups[id]);
			var group = lkk_groups[id];
			options += '<option value="' + id + '">' + group["name"] + '</option>';
		}
		return '<select id="lkk_groups">' + options + '</select>';
	}

	function get_contact(contact_id, email_index) {
		for (var i in lkk_addrs) {
			var contact = lkk_addrs[i];
			if (contact["contact_id"] != contact_id) {
				continue;
			}
			return { name: contact["name"], email: contact["email"][email_index] };
		}
	}

	function lkk_init() {
		// console.log("lkk_init");

		if (Object.keys(lkk_global_addrs).length == 0 && Object.keys(lkk_global_groups).length == 0) {
			globaladdressbook = false;
		} else {
			globaladdressbook = true;
		}

		Address["to"] = $('textarea[name="_to"]').val();
		Address["to_array"] = Address["to"].split(/\s*,\s*/);
		Address["cc"] = $('textarea[name="_cc"]').val();
		Address["cc_array"] = Address["cc"].split(/\s*,\s*/);
		Address["bcc"] = $('textarea[name="_bcc"]').val();
		Address["bcc_array"] = Address["bcc"].split(/\s*,\s*/);

		if ($('.lkk_addressbook')[0]) {
			// $('.lkk_addressbook .group').html(get_group_html());
			$('.lkk_addressbook .addrs').html(get_address_html());
			$('.lkk_addressbook').show();
			return;
		}

		if (globaladdressbook) {
			lkk_groups = lkk_global_groups;
			lkk_addrs = lkk_global_addrs;
		} else {
			lkk_groups = lkk_local_groups;
			lkk_addrs = lkk_local_addrs;
		}

		$('body').append('<div class="lkk_addressbook">' +
			'<header>' +
			'<div class="toolbar">' +
			'<button class="close" title="' + rcmail.gettext('close', 'lkk_addressbook') + '">&times;</button>' +
			'<span class="area"></span>' +
			'<span class="group"></span>' +
			'<button class="done">' + rcmail.gettext('done', 'lkk_addressbook') + '</button>' +
			'</div>' +
			'</header>' +
			'<div class="addrs_wrap">' +
			'<div class="addrs"></div>' +
			'</div>' +
			'</div>');

		$('.lkk_addressbook .area').html(get_area_html());
		$('.lkk_addressbook .group').html(get_group_html());
		$('.lkk_addressbook .addrs').html(get_address_html());

		$(document).on('click', '.lkk_addressbook .close', function () {
			close_dialog();
		});

		$(document).on('change', '#lkk_groups', function () {
			$('.lkk_addressbook .addrs').html(get_address_html());
		});

		$(document).on('change', '#lkk_area', function () {
			// console.log($('#lkk_area').val());
			if ($('#lkk_area').val() == 'global') {
				lkk_groups = lkk_global_groups;
				lkk_addrs = lkk_global_addrs;
			} else {
				lkk_groups = lkk_local_groups;
				lkk_addrs = lkk_local_addrs;
			}
			$('.lkk_addressbook .group').html(get_group_html());
			$('.lkk_addressbook .addrs').html(get_address_html());
		});

		$(document).on('click', '.lkk_addressbook .done', function () {
			$('textarea[name="_to"]').val(Address["to"]);
			$('textarea[name="_cc"]').val(Address["cc"]);
			$('textarea[name="_bcc"]').val(Address["bcc"]);

			if (rcmail_ui && rcmail_ui.show_header_form) {
				if (Address["cc"].length > 0 && $('#compose-cc').css("display") === "none") {
					rcmail_ui.show_header_form('cc');
				}
				if (Address["bcc"].length > 0 && $('#compose-bcc').css("display") === "none") {
					rcmail_ui.show_header_form('bcc');
				}
			} else {
				console.log("'rcmail_ui.show_header_form' is not found");
			}

			close_dialog();
		});

		// to, cc, bcc
		$(document).on('change', '.lkk_addressbook input[type="checkbox"]', function () {
			var self = $(this);
			var group = self.attr("group");
			var toccbcc = self.val();
			var status = self.prop('checked');

			if (group === "all") {
				$('.lkk_addressbook input').prop('checked', false);
				$('.lkk_addressbook input[value="' + toccbcc + '"]').prop('checked', status);

				$('.lkk_addressbook .email').each(function () {
					var e = $(this);
					var email_index = e.attr("email_index");
					var contact_id = e.attr("contact_id");
					// console.log('contact_id: ' + contact_id}');
					var contact = get_contact(contact_id, email_index);
					// console.log(contact);
					set_address(contact["name"], contact["email"], "to", toccbcc == "to" ? status : false);
					set_address(contact["name"], contact["email"], "cc", toccbcc == "cc" ? status : false);
					set_address(contact["name"], contact["email"], "bcc", toccbcc == "bcc" ? status : false);
				});
			} else {
				$('.lkk_addressbook input[group="' + group + '"]').prop('checked', false);
				self.prop('checked', status);

				var e = $('.lkk_addressbook .email[group="' + group + '"]');
				var email_index = e.attr("email_index");
				var contact_id = e.attr("contact_id");
				// console.log('contact_id: ' + contact_id + '');
				var contact = get_contact(contact_id, email_index);
				// console.log(contact);
				set_address(contact["name"], contact["email"], "to", toccbcc == "to" ? status : false);
				set_address(contact["name"], contact["email"], "cc", toccbcc == "cc" ? status : false);
				set_address(contact["name"], contact["email"], "bcc", toccbcc == "bcc" ? status : false);
			}
		});
	}

	function close_dialog() {
		$('.lkk_addressbook').hide();
	}

	function set_address(name, email, toccbcc, status) {
		var regexp = getMatchEmailRegexp(email)
		if (Address[toccbcc].match(regexp) === null) {
			// console.log("not found");
			if (status) {
				// add address
				Address[toccbcc + '_array'].push('' + name + ' <' + email + '>');
			}
		} else {
			// console.log("found");
			if (!status) {
				// console.log("remove");
				// remove address
				for (var key in Address[toccbcc + '_array']) {
					if (Address[toccbcc + '_array'][key].match(regexp) === null) {
						continue;
					}
					// console.log('!!! ' + Address[toccbcc + '_array'][key]);
					Address[toccbcc + '_array'].splice(key, 1);
					// delete Address[toccbcc + '_array'][key];
				}
			}
		}
		// console.log(Address[toccbcc + '_array']);
		Address[toccbcc] = (Address[toccbcc + '_array'].join(", ").replace(/,[\s,]*/g, ", ").replace(/(^[\s,]*|[\s,]*$)/g, "") + ", ").replace(/^[\s,]*$/, "");
		// console.log(Address[toccbcc]);
	}

	rcmail.addEventListener('init', function (event) {
		$(document).on('click', '.title label', function () {
			lkk_init();
		});
	});

})();
