<?php

class lkk_addressbook extends rcube_plugin {
	public $task = 'mail';
	public $action = 'compose';
	private $global_address = true; // false;
	private $addrs = array();
	private $groups = array();

	function init() {
        // echo 'test init';
		$rcmail = rcmail::get_instance();
		if ($rcmail->action == 'compose') {
            $this->api->add_content($this->output_footer(), "toolbar");
			$this->include_script('lkk_abk.js');
			$this->include_stylesheet("skins/default/templates/lkk.css");
		}

		$this->add_texts('localization/', true);

        // output footer
		// $rcmail->output->add_footer($this->output_footer());
	}

	function output_footer() {
		$ret = "<script>\n";
		// $ret .= 'var lkk_groups = '.json_encode($this->get_groups()).";\n";
		// $ret .= 'var lkk_addrs = '.json_encode($this->get_addresses()).";\n";
		$ret .= 'lkk_groups = '.json_encode($this->get_groups()).";\n";
		$ret .= 'lkk_addrs = '.json_encode($this->get_addresses()).";\n";
		$ret .= "</script>\n";
		return $ret;
	}

    /**
     * get users data
     */
    function get_addresses() {
        $addr=rcmail::get_instance()->get_address_book('sql');
        $addr->set_pagesize(9999);
        // $rt=$addr->list_records(array('name','email','contact_id'));
        $rt=$addr->list_records(array('name','email'));
        // var_dump($rt);
        while($u=$rt->next()){
            // var_dump($u);
            $this->addrs[]=array('name'=>$u['name'],'email'=>$u['email'],'contact_id'=>$u['contact_id']);
            // $this->addrs[]=array('name'=>$u['name'],'email'=>$u['email']);
        }

        // Global AddressBook
        if ($this->global_address === true) {
            $addr=rcmail::get_instance()->get_address_book('global');
            $addr->set_pagesize(9999);
            //$rt=$addr->list_records(array('name','email','contact_id'));
			$rt=$addr->list_records(array('name','email'));
			$addrs = array();
            while ($u=$rt->next()) {
                $addrs[]=array('name'=>$u['name'],'email'=>$u['email'],'contact_id'=>$u['contact_id']);
                //$this->addrs[]=array('name'=>$u['name'],'email'=>$u['email']);
            }
		}
		return $addrs;
        //var_dump($this->addrs);
	}

    /**
     * get groups data
     */
    function get_groups(){
        $global_addressbook_user_id = 0;
		if ($this->global_address !== true){
		    $addr = rcmail::get_instance()->get_address_book('global');
		    $global_groups = $addr->list_groups();
		    var_dump($addr->list_groups());
            $a = $addr->list_groups();
            $global_addressbook_user_id = $a[0]['user_id'];
		}
        $rcmail = rcmail::get_instance();
        //var_dump($rcmail);
        $db = $rcmail->db;
        $user_id = $rcmail->user->data['user_id'];
        // exclude global address book with global address book user_id if disabled.
		$sql_result = $db->query("SELECT * FROM contactgroups,contactgroupmembers WHERE contactgroups.contactgroup_id = contactgroupmembers.contactgroup_id AND user_id != ?", $global_addressbook_user_id);
		$groups = array();
        while ($sql_arr = $db->fetch_assoc($sql_result)) {
            //echo $sql_arr['contactgroup_id'];
            $groups[$sql_arr['contactgroup_id']]['name'] = $sql_arr['name'];
            $groups[$sql_arr['contactgroup_id']]['contact_id'][] = $sql_arr['contact_id'];
        }
		//var_dump($this->groups);
		return $groups;
	}

}
