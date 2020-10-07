var WshShell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");


function ReplaceAll(strVar, old_sub, new_sub)
{
	var new_str = "";
	for ( var i=0; i<strVar.length; i++ )
	{
		var c =  strVar.substr(i, 1);
		if ( c == old_sub )
			new_str += new_sub;
		else
			new_str += c;
	}
	return new_str;
}

function Unzip(source, target)
{
	WScript.Echo("    Unzipping file " + source + " to " + target);
	var appshell = new ActiveXObject("Shell.Application");
	var zipfiles = appshell.NameSpace(source).items();
	appshell.Namespace(target).CopyHere(zipfiles);
}

var root_url = "http://weebly.simulation.com/Downloads";
var back_home = WshShell.ExpandEnvironmentStrings("%USERPROFILE%");
var home = ReplaceAll(back_home, '\\', '/');
py_path = "C:\\Program Files\\Python38\\python.exe";
			 

function Unzip(source, target)
{
	WScript.Echo("    Unzipping file " + source + " to " + target);
	var appshell = new ActiveXObject("Shell.Application");
	var zipfiles = appshell.NameSpace(source).items();
	appshell.Namespace(target).CopyHere(zipfiles);
}

// Perform downloads via curl.exe program.
function DoDownload(url, destination)
{
	WScript.Echo("    Downloading " + url);
	try
	{
		var install = "curl.exe -o " + destination + " " + url;
        var exCmd = WshShell.Exec(install);
        WScript.StdOut.Write("    ");
		while ( exCmd.Status == 0 )
		{
            WScript.StdOut.Write(".");
			WScript.Sleep(400);
		}

        WScript.Echo(); // Print line feed to the screen.
		return 1;	// Successful download.
	}
	catch (err)
	{
		WScript.Echo("    " + install + " failed: " + err.message);
		return 0;	// Failure to download case.
	}	
}

var SUCCESS = 0;
var FILE_FOUND = true;

function InstallCombineScript()
{
	WScript.Echo("Checking existence of combine.py in current directory.");
	var test = fso.FileExists('combine.py');
	if ( test == FILE_FOUND )
	{
		WScript.Echo("    File: combine.py already exists.");
		return 0;
	}

	DoDownload( root_url + '/combine.py', 'combine.py' );

	test = fso.FileExists('combine.py');
	if ( test == FILE_FOUND )
		WScript.Echo("    File: combine.py downloaded successfully.");
	else
		WScript.Echo("    File: combine.py download failed.")
}

function InstallPython()
{
	WScript.Echo("Checking existence of the Python 3.8 interpreter.");

	try
	{
		WshShell.run('"' + py_path + '" combine.py test', 2, 1);
		WScript.Echo ("    Python 3.8 and components are already installed.");
		return 0;
	}
	catch(e)
	{
		WScript.Echo("    Python 3.8 not yet installed.");
	}

	var url = "https://www.python.org/ftp/python/3.8.5/python-3.8.5-amd64.exe";
	var local_file = "python3_installer.exe";
	DoDownload( url, local_file );

	// Install the interpreter
	WScript.Echo("    Running the Python 3.8 installer.");
	WshShell.run(local_file + ' /passive InstallAllUsers=1 PrependPath=1', 2, 1);

	//Use pip to install the necessary libraries for MIMC.
	var pip = '"C:\\Program Files\\Python38\\Scripts\\pip.exe"';
	WScript.Echo("    Installing websockets python module");
	WScript.Echo("    " + pip + ' install websockets');
	WshShell.run(pip + ' install websockets', 2, 1);

	WScript.Echo("    Installing python-pptx module");
	WshShell.run(pip + ' install python-pptx', 2, 1);

	WScript.Echo("    Installing winapi python module");
	WshShell.run(pip + ' install winapi', 2, 1);

	// Retest installation.
	try
	{
		WshShell.run('"' + py_path + '" combine.py test', 2, 1);
		WScript.Echo ("    Python 3.8 and components installed successfully.");
	}
	catch(e)
	{
		WScript.Echo("    Error: " + e.message);
		WScript.Echo("    Python 3.8 installation failed.");
	}
}

function InstallChrome()
{
	WScript.Echo("Checking existence of the Google Chrome browser.");

	var test = fso.FileExists('C:/Users/Public/Desktop/Google Chrome.lnk');
	if ( test == FILE_FOUND )
	{
		WScript.Echo ("    The Google Chrome browser is already installed.");
		return 0;
	}

	// Download the 2 files that make up the installer.
	var url = root_url + '/GoogleChromeEnterpriseBundle64.zip.0';
	DoDownload(url + '0', 'GoogleChrome64.zip.00');
	DoDownload(url + '1', 'GoogleChrome64.zip.01');

	// Combine the files we just downloaded
	var combine_command = '"' + py_path + '" combine.py';
	combine_command += ' GoogleChrome64.zip chrome.zip';
	WScript.Echo("    Executing: " + combine_command);
	WshShell.run(combine_command, 2, 1);

	// Prepare the unzip the file into a separate folder.
	var curr_dir = WshShell.CurrentDirectory;
	var unzip_folder = curr_dir + '\\Chrome_installer';
	// Create the unzip target folder if it doesn't exist.
	if ( !fso.FolderExists(unzip_folder) )
		fso.CreateFolder(unzip_folder);

	// Must supply full paths to the Unzip function.
	Unzip(curr_dir + '\\chrome.zip', unzip_folder);

	var chrome_exe = "Chrome_Installer/Installers/GoogleChromeStandaloneEnterprise64.msi";
	if ( fso.FileExists(chrome_exe) )
	{
		WScript.Echo("    Google Chrome installer expansion successful.");
		fso.MoveFile(chrome_exe, "GoogleChromeStandaloneEnterprise64.msi");
	}
	else
	{
		WScript.Echo("    Google Chrome installer expansion failed.");
		WScript.Quit(-1);
	}

	WScript.Echo("    Running MsiExec.exe /i GoogleChromeStandaloneEnterprise64.msi /qn");
	var exCmd = WshShell.Exec("MsiExec.exe /i googlechromestandaloneenterprise64.msi /qn");

	WScript.StdOut.Write("    ");
	while ( exCmd.Status == 0 )
	{
		WScript.StdOut.Write(".");
		WScript.Sleep(700);
	}

	test = fso.FileExists('C:/Users/Public/Desktop/Google Chrome.lnk');
	if ( test == FILE_FOUND )
		WScript.Echo ("\n    The Google Chrome browser installed successfully.");
	else
		WScript.Echo("\n    Google Chrome installation failed");
}

function InstallMIMC()
{

	WScript.Echo("Checking the existence of the Mountain Island Media Center.");
	var test = fso.FileExists(home + "/Miweb/webmc.cfg");
	if ( test == FILE_FOUND )
	{
		WScript.Echo ("    The Mountain Island Media Center is already installed.");
		return 0;
	}

	var url = root_url + '/miweb.zip.0';
	DoDownload(url + '0', 'miweb.zip.00');
	DoDownload(url + '1', 'miweb.zip.01');
	DoDownload(url + '2', 'miweb.zip.02');
	DoDownload(url + '3', 'miweb.zip.03');
	DoDownload(url + '4', 'miweb.zip.04');

	WScript.Echo("    Combining the Media Center zip file.")

	// Combine the miweb.zip.* files into a single miweb.zip file.
	var combine_command = '"' + py_path + '" combine.py miweb.zip miweb.zip';
	WshShell.run(combine_command, 2, 1);

	// Then unzip the miweb.zip combined file.
    Unzip(WshShell.CurrentDirectory + "\\miweb.zip", back_home);
    
    // Create a desktop icon for miweb.bat
    var desktop = WshShell.SpecialFolders("Desktop");
    var shortcut = WshShell.CreateShortcut(desktop + "\\Media Center.lnk");
    shortcut.WindowStyle = 7; // Minimized (0 = Maximized, 4 = Normal)
    shortcut.IconLocation = back_home + "\\Miweb\\image\\miweb.ico";
    shortcut.TargetPath = back_home + "\\Miweb\\miweb.bat";
    shortcut.WorkingDirectory = back_home + "\\Miweb\\python";
    shortcut.Save();

    // Set the SWORD_PATH environment variable
    WshShell.run('setx.exe SWORD_PATH ' + back_home + '\\Miweb\\util\\diatheke-4.0', 2, 1);

    test = fso.FileExists(home + "/Miweb/webmc.cfg");
	if ( test == FILE_FOUND )
		WScript.Echo("    The Mountain Island Media Center installed successfully.");
	else
		WScript.Echo("    The Mountain Island Media Center installation failed.");
}

function PresentationSoftwareCheck()
{
    var librekey = "HKLM\\Software\\The Document Foundation\\LibreOffice\\";
    var msofficekey = "HKLM\\SOFTWARE\\Microsoft\\Office\\";
    var key = 0;
    try
    {
        key = WshShell.RegRead(msofficekey);
        // Configure webmc.cfg presentation string for MSoffice.
        var changes = ReplaceConfigString("pptx=", "C:\\Program Files\\Microsoft\\Office\\powerpnt.exe,--show,<file>");
        if ( changes > 0 )
        {
            WScript.Echo("    Updated configuration key 'pptx' to 'C:\\Program Files\\Microsoft\\Office\\powerpnt.exe,--show,<file>'");
            return 0;
        }
        else
            WScript.Echo("    Did not find the key 'pptx=' in webmc.cfg file");
    }
    catch (e)
	{
        if ( e.message == 'File not found' )
        {
            WScript.Echo("    MS Office is installed on this machine.");
            var changes = ReplaceConfigString("pptx=", "C:\\Program Files\\Microsoft\\Office\\powerpnt.exe,--show,<file>");
            if ( changes > 0 )
                WScript.Echo("    Configuration key pptx=C:\\Program Files\\Microsoft\\Office\\powerpnt.exe,--show,<file>");
            return 0;
        }
        else
            WScript.Echo("    " + msofficekey + " key not found in registry");
    }
    try
    {
        key = WshShell.RegRead(librekey);
        WScript.Echo("    Libre Office is installed on this machine.");
        // Note: The default webmc.cfg value for pptx is Libre Office, so no change is necessary in this case.
        return 0;
    }
    catch (e)
	{
        WScript.Echo("    Libre Office key not found in registry");
 		return 1;
    }
}

/* The ReplaceConfigString function edits the webmc.cfg file. It looks for the provided key,
   which is a string on the left side of an '=' sign (for example, "pptx", or include the '=',
   'pptx=') and the value provided will replace any pre-existing text on that line (following
   the '=' sign.
*/
function ReplaceConfigString( key, value )
{
    var changes = 0;
    WScript.Echo("    Updating configuration file for key " + key);

    // If the provided key does not include the '=', nor does the value...
    if ( key.indexOf('=') == -1 )
        if ( value.indexOf('=') != 0 )
            value = '=' + value; // Prepend '=' to the value

    try
    {
        var readcfg = fso.OpenTextFile(home + '/Miweb/webmc.cfg', 1); // Read only mode
        var writecfg = fso.OpenTextFile("tmp.cfg", 2, 1); // Temporary file opened in write mode
        WScript.Echo("    Opened " + home + '/Miweb/webmc.cfg for reading');
        WScript.Echo("    Opened tmp.cfg for writing");
        while ( !readcfg.AtEndOfStream )
        {
           var line = readcfg.ReadLine();
            if ( line.indexOf(key) == 0 )
            {
                writecfg.WriteLine(key + value);
                changes++;
            }
            else
                writecfg.WriteLine(line);
        }
        readcfg.close();
        writecfg.close();
        fso.DeleteFile(home + '/Miweb/webmc.cfg');
        fso.MoveFile('tmp.cfg', home + '/Miweb/webmc.cfg');
     }
    catch(e)
    {
        WScript.Echo("    Error while updating configuration: " + e.message);
    }

   return changes;
}

function InstallLibreOffice()
{
	WScript.Echo("Looking for presentation software installation(s)");

	// PresentationSoftwareCheck tests and reconfigures webmc.cfg as necessary.
	var test = PresentationSoftwareCheck();

	if ( test == SUCCESS )
	{
		WScript.Echo("    Presentation software already installed.");
		return 0;
	}

	// Download the libreoffice installer files.
    DoDownload(root_url + "/LibreOffice_7.0.1_Win_x64.msi.00", 'libreoffice.msi.00');
    DoDownload(root_url + "/LibreOffice_7.0.1_Win_x64.msi.01", 'libreoffice.msi.01');
    DoDownload(root_url + "/LibreOffice_7.0.1_Win_x64.msi.02", 'libreoffice.msi.02');
    DoDownload(root_url + "/LibreOffice_7.0.1_Win_x64.msi.03", 'libreoffice.msi.03');

	// Combine the files we just downloaded (along with the '00' file)
	var combine_command = '"' + py_path + '" combine.py';
	combine_command += ' libreoffice.msi LibreOffice_7.0.1_Win_x64.msi';
	WshShell.run(combine_command, 2, 1);

    WScript.Echo("    Installing LibreOffice");
    WScript.Echo("    Please follow the installer prompts to complete presentation software installation");
    WshShell.run("LibreOffice_7.0.1_Win_x64.msi", 2, 1);

    test = PresentationSoftwareCheck();

	if ( test == SUCCESS )
		WScript.Echo("    Presentation software installed successfully.");
	else
		WScript.Echo("    Presentation software installation failed.");
}

// The following are the sequence of installation commands that call the functions
// defined above.

InstallCombineScript();
InstallPython();
InstallChrome();
InstallMIMC();
InstallLibreOffice();

WScript.Echo("End of install.js");

