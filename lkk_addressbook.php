<?php

class lkk_addressbook extends rcube_plugin {

	function init() {
		// echo 'lkk_addressbook init';

		$rcmail = rcmail::get_instance();
		if ($rcmail->action == 'compose') {
			$this->api->add_content($this->get_user_group_array(), "toolbar");
			$this->include_script('lkk_abk.js');
			$this->include_stylesheet("skins/default/templates/lkk.css");
		}

		$this->add_texts('localization/', true);

		// output footer
		// $rcmail->output->add_footer($this->get_user_group_array());
	}

	function get_user_group_array() {
		$ret = "<script>\n";
		$ret .= 'lkk_global_groups = '.json_encode($this->get_global_groups()).";\n";
		$ret .= 'lkk_global_addrs = '.json_encode($this->get_global_address()).";\n";
		//
		$ret .= 'lkk_local_groups = '.json_encode($this->get_local_groups()).";\n";
		$ret .= 'lkk_local_addrs = '.json_encode($this->get_local_address()).";\n";
		$ret .= "</script>\n";
		return $ret;
	}

	/**
	 * get global address data
	 */
	function get_global_address() {
		// Global AddressBook
		$addr=rcmail::get_instance()->get_address_book('global');
		$addr->set_pagesize(9999);
		//$rt=$addr->list_records(array('name','email','contact_id'));
		$rt=$addr->list_records(array('name','email'));
		$addrs = array();
		while ($u=$rt->next()) {
			$addrs[]=array('name'=>$u['name'],'email'=>$u['email'],'contact_id'=>$u['contact_id']);
			//$this->addrs[]=array('name'=>$u['name'],'email'=>$u['email']);
		}
		return $addrs;
	}

	/**
	 * get global groups data
	 */
	function get_global_groups(){
		$global_addressbook_user_id = 0;
		$addr = rcmail::get_instance()->get_address_book('global');
		$global_groups = $addr->list_groups();
		// var_dump($addr->list_groups());
		$a = $addr->list_groups();
		$global_addressbook_user_id = $a[0]['user_id'];

		$rcmail = rcmail::get_instance();
		//var_dump($rcmail);
		$db = $rcmail->db;
		$user_id = $rcmail->user->data['user_id'];
		$sql_result = $db->query("SELECT * FROM contactgroups,contactgroupmembers WHERE del=0 AND contactgroups.contactgroup_id = contactgroupmembers.contactgroup_id AND user_id = ?", $global_addressbook_user_id);
		$groups = array();
		while ($sql_arr = $db->fetch_assoc($sql_result)) {
			// echo $sql_arr['contactgroup_id'];
			$groups[$sql_arr['contactgroup_id']]['name'] = $sql_arr['name'];
			$groups[$sql_arr['contactgroup_id']]['contact_id'][] = $sql_arr['contact_id'];
		}
		// var_dump($this->groups);
		return $groups;
	}

	/**
	 * get local address data
	 */
	function get_local_address() {
		$addr=rcmail::get_instance()->get_address_book('sql');
		$addr->set_pagesize(9999);
		// $rt=$addr->list_records(array('name','email','contact_id'));
		$rt=$addr->list_records(array('name','email'));
		// var_dump($rt);
		while($u=$rt->next()){
			// var_dump($u);
			// $this->addrs[]=array('name'=>$u['name'],'email'=>$u['email'],'contact_id'=>$u['contact_id']);
			$addrs[]=array('name'=>$u['name'],'email'=>$u['email'],'contact_id'=>$u['contact_id']);
			// $this->addrs[]=array('name'=>$u['name'],'email'=>$u['email']);
		}
		// var_dump($this->addrs);
		return $addrs;
	}

	/**
	 * get local groups data
	 */
	function get_local_groups(){
		$rcmail = rcmail::get_instance();
		//var_dump($rcmail);
		$db = $rcmail->db;
		$user_id = $rcmail->user->data['user_id'];
		$sql_result = $db->query("SELECT * FROM contactgroups,contactgroupmembers WHERE del=0 AND contactgroups.contactgroup_id = contactgroupmembers.contactgroup_id AND user_id = ?", $user_id);
		$groups = array();
		while ($sql_arr = $db->fetch_assoc($sql_result)) {
			// echo $sql_arr['contactgroup_id'];
			$groups[$sql_arr['contactgroup_id']]['name'] = $sql_arr['name'];
			$groups[$sql_arr['contactgroup_id']]['contact_id'][] = $sql_arr['contact_id'];
		}
		// var_dump($this->groups);
		return $groups;
	}

}
