/*
 * This program is copyright © 2013 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

tginfoS = new Object();

var pkg = "3ginfo";

function resetData()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");

	setSelectedValue('list_device', uciOriginal.get(pkg, sec[0], 'device'));

	if (uciOriginal.get(pkg, sec[0], 'device') == "")
	{
		return;
	}

	setControlsEnabled(false, true, tginfoS.DldingData);
	var param = getParameterDefinition("commands", '/usr/share/3ginfo/3ginfo-automat\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var lines = req.responseText.split(/[\n\r]+/);

			setChildText("status", "-");
			setChildText("conn_time", "-");
			setChildText("rx", "-");
			setChildText("tx", "-");
			setChildText("mode", "-");
			setChildText("gmode", "-");
			setChildText("cops", "-");
			setChildText("gcops", "-");
			setChildText("cops_mcc", "-");
			setChildText("cops_mnc", "-");
			setChildText("csq_per", "-");
			setChildText("gcsq_per", "-");
			setChildText("csq", "-");
			setChildText("csq_rssi", "-");
			setChildText("qos", "-");
			setChildText("lac", "-");
			setChildText("lcid", "-");
			setChildText("rnc", "-");
			setChildText("cid", "-");
			setChildText("device", "-");

			document.getElementById("qos_container").style.display = uciOriginal.get(pkg, sec[0], 'qos') == 1?"block":"none";

			var csq = 0;
			for (var idx=0; idx<lines.length; idx++)
			{
				var arr = lines[idx].replace(/<.*?>/g, "").split(":");
				if (arr[0].match(/^status/))
				{
					if (arr[1].match(/Connected/)) { setChildText("status", tginfoS.Conn); }
					if (arr[1].match(/Disconnected/)) { setChildText("status", tginfoS.DisConn); }
					if (arr[1].match(/No information/)) { setChildText("status", tginfoS.NoInfo); }
				}
				if (arr[0].match(/^conn_time/)) { setChildText("conn_time", arr[1] == "-"?arr[1]:arr[1]+":"+arr[2]+":"+arr[3]); }
				if (arr[0].match(/^rx/))	{ setChildText("rx", arr[1]); }
				if (arr[0].match(/^tx/))	{ setChildText("tx", arr[1]); }
				if (arr[0].match(/^mode/))	{ setChildText("mode", arr[1]); }
				if (arr[0].match(/^cops$/))	{ setChildText("cops", arr[1]); }
				if (arr[0].match(/^cops_mcc/))	{ setChildText("cops_mcc", arr[1]); }
				if (arr[0].match(/^cops_mnc/))	{ setChildText("cops_mnc", arr[1]); }
				if (arr[0].match(/^csq_per/))	{ csq = arr[1]; }
				if (arr[0].match(/^csq$/))	{ setChildText("csq", arr[1]); }
				if (arr[0].match(/^csq_rssi/))	{ setChildText("csq_rssi", arr[1] + "dBm"); }
				if (arr[0].match(/^qos/))	{ setChildText("qos", arr[1]); }
				if (arr[0].match(/^lac/))	{ setChildText("lac", arr[1]); }
				if (arr[0].match(/^lcid/))
				{
					document.getElementById("lcid_container").style.display = arr[1].match(/- (-)/)?"block":"none";
					setChildText("lcid", arr[1]);
				}
				if (arr[0].match(/^rnc/))
				{
					document.getElementById("rnc_container").style.display = arr[1].match(/- (-)/)?"block":"none";
					setChildText("rnc", arr[1]);
				}
				if (arr[0].match(/^cid/))	{ setChildText("cid", arr[1]); }
				if (arr[0].match(/^device/))	{ setChildText("device", arr[1]); }
			}

			setGraph(csq);
			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function setGraph(csq)
{
	if (csq > 0) { setChildText("csq_per", csq + "%"); }
	document.getElementById("s100p").style.display = csq > 90?"block":"none";
	document.getElementById("s90p").style.display = csq > 80 && csq <= 90?"block":"none";
	document.getElementById("s80p").style.display = csq > 70 && csq <= 80?"block":"none";
	document.getElementById("s70p").style.display = csq > 60 && csq <= 70?"block":"none";
	document.getElementById("s60p").style.display = csq > 50 && csq <= 60?"block":"none";
	document.getElementById("s50p").style.display = csq > 40 && csq <= 50?"block":"none";
	document.getElementById("s40p").style.display = csq > 30 && csq <= 40?"block":"none";
	document.getElementById("s30p").style.display = csq > 20 && csq <= 30?"block":"none";
	document.getElementById("s20p").style.display = csq > 10 && csq <= 20?"block":"none";
	document.getElementById("s10p").style.display = csq >  0 && csq <= 10?"block":"none";
	document.getElementById("s0p").style.display = csq == 0?"block":"none";
}

function setDevice(device)
{
	setControlsEnabled(false, true, UI.Wait);
	var param = getParameterDefinition("commands", 'uci set 3ginfo.@3ginfo[0].device='+device+'\nuci commit 3ginfo\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");
			uciOriginal.set(pkg, sec[0], "device", device);
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
